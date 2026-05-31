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


// Гибридные рекомендации (коллаборативная + контентная + друзья)
export const getHybridRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    // 1. Получаем любимые жанры пользователя (фильмы с оценкой 4 или 5)
    const favoriteGenres = await db.all(`
      SELECT DISTINCT m.genre
      FROM user_ratings ur
      JOIN movies m ON m.id = ur.movie_id
      WHERE ur.user_id = ? AND ur.rating >= 4
    `, [userId]);
    
    const genreList = favoriteGenres.map(g => g.genre);
    
    // 2. Получаем друзей пользователя
    const friends = await db.all(`
      SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted'
    `, [userId]);
    
    const friendIds = friends.map(f => f.friend_id);
    
    let recommendations = [];
    
    // 3. Если есть друзья - рекомендации от друзей (с повышенным весом)
    if (friendIds.length > 0) {
      const friendPlaceholders = friendIds.map(() => '?').join(',');
      recommendations = await db.all(`
        SELECT 
          m.*, 
          AVG(ur.rating) as avg_rating,
          COUNT(ur.rating) as rating_count,
          (AVG(ur.rating) * 1.2) as weighted_score
        FROM movies m
        JOIN user_ratings ur ON ur.movie_id = m.id
        WHERE ur.user_id IN (${friendPlaceholders})
        AND ur.movie_id NOT IN (
          SELECT movie_id FROM user_ratings WHERE user_id = ?
        )
        GROUP BY m.id
        ORDER BY weighted_score DESC
        LIMIT 10
      `, [...friendIds, userId]);
    }
    
    // 4. Если рекомендаций от друзей меньше 5 - дополняем контентными по жанрам
    if (recommendations.length < 5 && genreList.length > 0) {
      const genrePlaceholders = genreList.map(() => '?').join(',');
      const contentBased = await db.all(`
        SELECT m.*, 
          CASE WHEN m.genre IN (${genrePlaceholders}) THEN 1 ELSE 0 END as genre_match
        FROM movies m
        WHERE m.id NOT IN (
          SELECT movie_id FROM user_ratings WHERE user_id = ?
        )
        ORDER BY genre_match DESC, m.avg_rating DESC
        LIMIT ?
      `, [...genreList, userId, 10 - recommendations.length]);
      
      recommendations = [...recommendations, ...contentBased];
    }
    
    // 5. Если рекомендаций всё ещё нет - fallback: топ фильмы по рейтингу
    if (recommendations.length === 0) {
      recommendations = await db.all(`
        SELECT * FROM movies ORDER BY avg_rating DESC LIMIT 10
      `);
    }
    
    // Убираем дубликаты (по id)
    const unique = recommendations.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    
    res.json(unique.slice(0, 10));
  } catch (error) {
    console.error('Error in getHybridRecommendations:', error);
    res.status(500).json({ error: 'Ошибка при получении гибридных рекомендаций' });
  }
};
