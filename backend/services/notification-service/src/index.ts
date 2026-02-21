import express from 'express';
import { NotificationService, Notification } from './NotificationService';

const app = express();
const port = process.env.PORT || 3006;

app.use(express.json());

const notificationService = new NotificationService();

app.post('/notifications', async (req, res) => {
  try {
    const notification: Notification = req.body;
    await notificationService.send(notification);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Notification service listening on port ${port}`);
});
