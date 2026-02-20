import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { configurePassport } from './config/passport';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import MongoStore from 'connect-mongo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Configure Passport
configurePassport();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI!,
    ttl: 24 * 60 * 60, // 1 day in seconds
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '3rdSpace API is running' });
});

import path from 'path';


// Serve React app — always, not just in production
const clientBuild = path.join(__dirname, '../../client/dist');
console.log('Serving client from:', clientBuild);
app.use(express.static(clientBuild));
app.get('*', (_req, res) => {
  const index = path.join(clientBuild, 'index.html');
  res.sendFile(index, err => {
    if (err) {
      console.error('Failed to serve index.html:', index, err);
      res.status(500).send('Client build not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 3rdSpace server running on http://localhost:${PORT}`);
});

export default app;
