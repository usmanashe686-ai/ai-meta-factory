import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

import projectRoutes from './routes/projects';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/projects', projectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'project-service' });
});

app.listen(PORT, () => {
  console.log(`✅ Project service running on port ${PORT}`);
});
