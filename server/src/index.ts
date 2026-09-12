import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import { configurePassport } from './config/passport';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import groupRoutes from './routes/groups';
import { publicWallRouter } from './routes/posts';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import { uploadsDir } from './utils/uploadsDir';

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

// script-src 'self' means even a <script> that slips past sanitize-html
// (bug, bypass, future regression) in customHTML still won't execute.
// style-src needs 'unsafe-inline' — that's the customCSS feature itself.
// frame-src matches sanitizeSongUrl's allowlist.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'frame-src': [
        "'self'",
        'https://www.youtube.com',
        'https://www.youtube-nocookie.com',
        'https://w.soundcloud.com',
        'https://open.spotify.com',
      ],
      // blob: is needed for the avatar cropper's local file preview
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    },
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory store is fine here — session only holds transient OAuth state,
// never real auth (that's the JWT bearer token, checked in requireAuth).
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000, // just needs to outlive the OAuth redirect round-trip
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/wall', publicWallRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '3rdSpace API is running' });
});

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
