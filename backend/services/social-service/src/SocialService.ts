/**
 * Social Service – handles follows, likes, comments on projects.
 * Requires additional models in Prisma (Follow, Like, Comment).
 * 
 * To use, add these models to your Prisma schema:
 * 
 * model Follow {
 *   followerId  String
 *   followingId String
 *   createdAt   DateTime @default(now())
 *   follower    User     @relation("follower", fields: [followerId], references: [id])
 *   following   User     @relation("following", fields: [followingId], references: [id])
 *
 *   @@id([followerId, followingId])
 *   @@index([followingId])
 * }
 * 
 * model Like {
 *   userId    String
 *   projectId String
 *   createdAt DateTime @default(now())
 *   user      User     @relation(fields: [userId], references: [id])
 *   project   Project  @relation(fields: [projectId], references: [id])
 *
 *   @@id([userId, projectId])
 *   @@index([projectId])
 * }
 * 
 * model Comment {
 *   id        String   @id @default(cuid())
 *   content   String   @db.Text
 *   userId    String
 *   projectId String
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 *   user      User     @relation(fields: [userId], references: [id])
 *   project   Project  @relation(fields: [projectId], references: [id])
 *
 *   @@index([projectId])
 *   @@index([userId])
 * }
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SocialService {
  // -------------------- Follow --------------------
  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    if (existing) {
      throw new Error('Already following this user');
    }
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async getFollowers(userId: string): Promise<any[]> {
    return prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, image: true } } },
    });
  }

  async getFollowing(userId: string): Promise<any[]> {
    return prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, image: true } } },
    });
  }

  // -------------------- Likes --------------------
  async likeProject(userId: string, projectId: string): Promise<void> {
    const existing = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
    if (existing) {
      throw new Error('Already liked this project');
    }
    await prisma.like.create({
      data: {
        userId,
        projectId,
      },
    });
  }

  async unlikeProject(userId: string, projectId: string): Promise<void> {
    await prisma.like.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  async getProjectLikes(projectId: string): Promise<number> {
    return prisma.like.count({ where: { projectId } });
  }

  async getLikedProjects(userId: string): Promise<any[]> {
    return prisma.like.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true, createdAt: true } } },
    });
  }

  // -------------------- Comments --------------------
  async addComment(userId: string, projectId: string, content: string): Promise<any> {
    return prisma.comment.create({
      data: {
        userId,
        projectId,
        content,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    if (comment.userId !== userId) {
      // Optionally check admin role
      throw new Error('Unauthorized');
    }
    await prisma.comment.delete({ where: { id: commentId } });
  }

  async getComments(projectId: string, limit = 50): Promise<any[]> {
    return prisma.comment.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
