import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import booksRouter from './routes/books.js';
import aiRouter from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://book-critic.onrender.com',
    /\.vercel\.app$/,
    /\.vercel\.dev$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/books', requireAuth(), booksRouter);
app.use('/api/ai', requireAuth(), aiRouter);

// Static files and SPA fallback only for non-Vercel (local production)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

export default app;
