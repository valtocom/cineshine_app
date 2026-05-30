import express from 'express';
import cors from 'cors';
import { initDB } from './database';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import friendRoutes from './routes/friendRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/friends', friendRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
