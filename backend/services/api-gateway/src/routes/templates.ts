import { Router } from 'express';
import prisma from '../lib/prisma';
import multer from 'multer';
import { unlink } from 'fs/promises';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = Router();
const upload = multer({ dest: '/tmp/uploads/' });

const saveThumbnail = async (file: Express.Multer.File): Promise<string> => {
  const ext = path.extname(file.originalname);
  const filename = `${uuidv4()}${ext}`;
  const destPath = path.join('public', 'uploads', filename);
  await require('fs/promises').rename(file.path, destPath);
  return `/uploads/${filename}`;
};

router.get('/', async (req, res) => {
  const { category, search, page = '1', limit = '12' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: any = {};
  if (category && category !== 'all') where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }
  try {
    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: { author: { select: { name: true, image: true } } },
    });
    const total = await prisma.template.count({ where });
    res.json({ templates, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.post('/', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const zipFile = files['file']?.[0];
    const thumbFile = files['thumbnail']?.[0];
    const { name, description, category } = req.body;
    if (!name || !description || !category || !zipFile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let thumbnailUrl: string | null = null;
    if (thumbFile) {
      thumbnailUrl = await saveThumbnail(thumbFile);
    }

    const zip = new AdmZip(zipFile.path);
    const zipEntries = zip.getEntries();
    const filesObj: Record<string, string> = {};
    zipEntries.forEach(entry => {
      if (!entry.isDirectory) {
        filesObj[entry.entryName] = entry.getData().toString('utf-8');
      }
    });
    await unlink(zipFile.path);
    if (thumbFile) await unlink(thumbFile.path).catch(() => {});

    const template = await prisma.template.create({
      data: {
        name,
        description,
        category,
        thumbnail: thumbnailUrl,
        files: filesObj,
        authorId: userId,
      },
    });
    res.status(201).json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    await prisma.template.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like template' });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    await prisma.template.update({
      where: { id: req.params.id },
      data: { downloads: { increment: 1 } },
    });
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json({ files: template.files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download template' });
  }
});

export default router;
