import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

dotenv.config();

import authRoutes from './routes/auth';
import jwtStrategy from './config/passport';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Passport
passport.use(jwtStrategy);
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

app.listen(PORT, () => {
  console.log(`✅ Auth service running on port ${PORT}`);
});
