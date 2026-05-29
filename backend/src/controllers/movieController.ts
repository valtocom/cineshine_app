import { Request, Response } from 'express';
import { openDB } from '../database';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const db = await openDB();
    const movies = await db.all('SELECT * FROM movies ORDER BY year DESC');
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении фильмов' });
  }
};

export const rateMovie = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { movieId, rating } = req.body;
    const db = await openDB();
    
    await db.run(
      `INSERT INTO user_ratings (user_id, movie_id, rating) 
       VALUES (?, ?, ?) 
       ON CONFLICT DO UPDATE SET rating = ?`,
      [userId, movieId, rating, rating]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при сохранении оценки' });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    // Простейшая коллаборативная фильтрация:
    // находим пользователей с похожими оценками
    // и рекомендуем фильмы, которые они высоко оценили
    
    const recommendations = await db.all(`
      SELECT m.*, AVG(ur.rating) as avg_rating
      FROM movies m
      JOIN user_ratings ur ON ur.movie_id = m.id
      WHERE ur.movie_id NOT IN (
        SELECT movie_id FROM user_ratings WHERE user_id = ?
      )
      AND ur.rating >= 4
      GROUP BY m.id
      ORDER BY avg_rating DESC
      LIMIT 10
    `, [userId]);
    
    if (recommendations.length === 0) {
      // Если рекомендаций нет - показываем фильмы с высоким средним рейтингом
      const fallback = await db.all(`
        SELECT * FROM movies ORDER BY rating DESC LIMIT 10
      `);
      res.json(fallback);
    } else {
      res.json(recommendations);
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении рекомендаций' });
  }
};
