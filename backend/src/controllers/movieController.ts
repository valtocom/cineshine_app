import { Request, Response } from 'express';
import { openDB } from '../database';

// Получить все фильмы
export const getMovies = async (req: Request, res: Response) => {
  try {
    const db = await openDB();
    const movies = await db.all('SELECT * FROM movies ORDER BY year DESC');
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении фильмов' });
  }
};

// Получить один фильм по ID
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await openDB();
    const movie = await db.get('SELECT * FROM movies WHERE id = ?', [id]);
    
    if (!movie) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }
    
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении фильма' });
  }
};

// Получить оценку пользователя для фильма
export const getUserRating = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const db = await openDB();
    
    const rating = await db.get(
      'SELECT rating FROM user_ratings WHERE user_id = ? AND movie_id = ?',
      [userId, id]
    );
    
    res.json({ rating: rating?.rating || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении оценки' });
  }
};

// Получить все оценки текущего пользователя
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    const ratings = await db.all(
      'SELECT movie_id, rating FROM user_ratings WHERE user_id = ?',
      [userId]
    );
    
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении оценок' });
  }
};

// Оценить фильм
export const rateMovie = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { movieId, rating } = req.body;
    const db = await openDB();
    
    // Сохраняем или обновляем оценку
    await db.run(
      `INSERT INTO user_ratings (user_id, movie_id, rating) 
       VALUES (?, ?, ?) 
       ON CONFLICT(user_id, movie_id) DO UPDATE SET rating = ?`,
      [userId, movieId, rating, rating]
    );
    
    // Обновляем средний рейтинг фильма
    const avgResult = await db.get(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM user_ratings WHERE movie_id = ?',
      [movieId]
    );
    
    await db.run(
      'UPDATE movies SET avg_rating = ?, ratings_count = ? WHERE id = ?',
      [avgResult.avg_rating || 0, avgResult.count || 0, movieId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при сохранении оценки' });
  }
};

// Простые рекомендации (коллаборативная фильтрация)
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
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
      const fallback = await db.all(`
        SELECT * FROM movies ORDER BY avg_rating DESC LIMIT 10
      `);
      res.json(fallback);
    } else {
      res.json(recommendations);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении рекомендаций' });
  }
};

// Гибридные рекомендации (коллаборативная + контентная + друзья)
export const getHybridRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    // 1. Получаем любимые жанры пользователя
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
    
    let recommendations: any[] = [];
    
    // 3. Рекомендации от друзей (с повышенным весом)
    if (friendIds.length > 0) {
      const placeholders = friendIds.map(() => '?').join(',');
      recommendations = await db.all(`
        SELECT 
          m.*, 
          AVG(ur.rating) as avg_rating,
          COUNT(ur.rating) as rating_count,
          (AVG(ur.rating) * 1.2) as weighted_score
        FROM movies m
        JOIN user_ratings ur ON ur.movie_id = m.id
        WHERE ur.user_id IN (${placeholders})
        AND ur.movie_id NOT IN (
          SELECT movie_id FROM user_ratings WHERE user_id = ?
        )
        GROUP BY m.id
        ORDER BY weighted_score DESC
        LIMIT 10
      `, [...friendIds, userId]);
    }
    
    // 4. Дополняем контентными рекомендациями по жанрам
    if (recommendations.length < 5 && genreList.length > 0) {
      const placeholders = genreList.map(() => '?').join(',');
      const contentBased = await db.all(`
        SELECT m.*, 
          CASE WHEN m.genre IN (${placeholders}) THEN 1 ELSE 0 END as genre_match
        FROM movies m
        WHERE m.id NOT IN (
          SELECT movie_id FROM user_ratings WHERE user_id = ?
        )
        ORDER BY genre_match DESC, m.avg_rating DESC
        LIMIT ?
      `, [...genreList, userId, 10 - recommendations.length]);
      
      recommendations = [...recommendations, ...contentBased];
    }
    
    // 5. Fallback: топ фильмы по рейтингу
    if (recommendations.length === 0) {
      recommendations = await db.all(`
        SELECT * FROM movies ORDER BY avg_rating DESC LIMIT 10
      `);
    }
    
    // Убираем дубликаты
    const unique = recommendations.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    
    res.json(unique.slice(0, 10));
  } catch (error) {
    console.error('Error in getHybridRecommendations:', error);
    res.status(500).json({ error: 'Ошибка при получении гибридных рекомендаций' });
  }
};
