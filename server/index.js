import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'https://jasroopdhingra.github.io',
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
