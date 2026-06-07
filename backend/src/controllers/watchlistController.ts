import { Request, Response } from 'express';
import { openDB } from '../database';

// Получить watchlist пользователя
export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    const watchlist = await db.all(
      `SELECT w.id, w.movie_id, m.title, m.year, m.poster_url
       FROM watchlist w
       JOIN movies m ON m.id = w.movie_id
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [userId]
    );
    
    res.json(watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении списка "Буду смотреть"' });
  }
};

// Добавить фильм в watchlist
export const addToWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { movieId } = req.params;
    
    const db = await openDB();
    
    // Проверяем, не добавлен ли уже
    const existing = await db.get(
      'SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Фильм уже в списке' });
    }
    
    await db.run(
      'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
      [userId, movieId]
    );
    
    res.json({ success: true, message: 'Фильм добавлен в список "Буду смотреть"' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при добавлении фильма' });
  }
};

// Удалить фильм из watchlist
export const removeFromWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { movieId } = req.params;
    
    const db = await openDB();
    
    await db.run(
      'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    
    res.json({ success: true, message: 'Фильм удалён из списка "Буду смотреть"' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении фильма' });
  }
};
