import express from 'express';
import cors from 'cors';
import { initDB } from './database';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Запуск сервера
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
