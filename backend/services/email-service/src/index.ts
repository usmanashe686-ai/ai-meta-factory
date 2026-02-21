import express from 'express';
import { createEmailService, EmailOptions } from './EmailService';

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

const emailService = createEmailService();

app.post('/send', async (req, res) => {
  try {
    const options: EmailOptions = req.body;
    const result = await emailService.sendEmail(options);
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Email service listening on port ${port}`);
});
