import { Request, Response } from 'express';
import { openDB } from '../database';

// Поиск пользователей по имени
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Введите поисковый запрос' });
    }

    const db = await openDB();
    const users = await db.all(
      `SELECT id, username, email FROM users 
       WHERE username LIKE ? AND id != ? 
       LIMIT 20`,
      [`%${q}%`, userId]
    );
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при поиске пользователей' });
  }
};
