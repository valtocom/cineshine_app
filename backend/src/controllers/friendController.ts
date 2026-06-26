import { Request, Response } from 'express';
import { openDB } from '../database';

// Отправить заявку в друзья
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { friendId } = req.body;
    
    console.log('📨 Отправка заявки от:', userId, 'к:', friendId);
    
    if (!friendId) {
      return res.status(400).json({ error: 'Не указан ID друга' });
    }
    
    if (userId === friendId) {
      return res.status(400).json({ error: 'Нельзя добавить самого себя' });
    }
    
    const db = await openDB();
    
    // Проверяем, существует ли пользователь
    const userExists = await db.get('SELECT id FROM users WHERE id = ?', [friendId]);
    if (!userExists) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, не друзья ли уже (активная дружба)
    const existing = await db.get(
      `SELECT * FROM friendships 
       WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );
    if (existing) {
      return res.status(400).json({ error: 'Пользователь уже в друзьях' });
    }
    
    // Проверяем, есть ли уже активная (pending) заявка от пользователя к этому другу
    const existingRequest = await db.get(
      'SELECT * FROM friend_requests WHERE from_user_id = ? AND to_user_id = ? AND status = "pending"',
      [userId, friendId]
    );
    if (existingRequest) {
      return res.status(400).json({ error: 'Заявка уже отправлена' });
    }
    
    // Проверяем, есть ли активная заявка от друга к пользователю
    const existingReverseRequest = await db.get(
      'SELECT * FROM friend_requests WHERE from_user_id = ? AND to_user_id = ? AND status = "pending"',
      [friendId, userId]
    );
    if (existingReverseRequest) {
      return res.status(400).json({ error: 'Пользователь уже отправил вам заявку' });
    }
    
    // Если есть старая отклонённая или принятая заявка - удаляем её, чтобы можно было отправить новую
    await db.run(
      'DELETE FROM friend_requests WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)',
      [userId, friendId, friendId, userId]
    );
    
    // Отправляем новую заявку
    await db.run(
      'INSERT INTO friend_requests (from_user_id, to_user_id, status) VALUES (?, ?, ?)',
      [userId, friendId, 'pending']
    );
    
    console.log('✅ Заявка отправлена');
    res.json({ success: true, message: 'Заявка отправлена' });
    
  } catch (error) {
    console.error('❌ Ошибка при отправке заявки:', error);
    res.status(500).json({ error: 'Ошибка при отправке заявки' });
  }
};

// Подтвердить заявку в друзья
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { requestId } = req.params;
    
    const db = await openDB();
    
    const request = await db.get(
      'SELECT * FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = "pending"',
      [requestId, userId]
    );
    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    await db.run('UPDATE friend_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['accepted', requestId]);
    
    await db.run(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)',
      [request.from_user_id, request.to_user_id, 'accepted']
    );
    await db.run(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)',
      [request.to_user_id, request.from_user_id, 'accepted']
    );
    
    res.json({ success: true, message: 'Заявка принята' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при принятии заявки' });
  }
};

// Отклонить заявку
export const declineFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { requestId } = req.params;
    
    const db = await openDB();
    
    await db.run(
      'UPDATE friend_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND to_user_id = ?',
      ['declined', requestId, userId]
    );
    
    res.json({ success: true, message: 'Заявка отклонена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при отклонении заявки' });
  }
};

// Получить список друзей
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    const friends = await db.all(`
      SELECT u.id, u.username, u.email, u.avatar_url
      FROM friendships f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ? AND f.status = 'accepted'
    `, [userId]);
    
    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении списка друзей' });
  }
};

// Получить входящие заявки
export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    const requests = await db.all(`
      SELECT fr.*, u.username as from_username
      FROM friend_requests fr
      JOIN users u ON u.id = fr.from_user_id
      WHERE fr.to_user_id = ? AND fr.status = 'pending'
    `, [userId]);
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
};

// Получить количество входящих заявок
export const getPendingRequestsCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    const result = await db.get(
      'SELECT COUNT(*) as count FROM friend_requests WHERE to_user_id = ? AND status = "pending"',
      [userId]
    );
    
    res.json({ count: result?.count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении количества заявок' });
  }
};

// Лента активности друзей
export const getFriendsFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await openDB();
    
    const feed = await db.all(`
      SELECT 
        ur.created_at,
        u.username as user_name,
        m.title as movie_title,
        ur.rating
      FROM user_ratings ur
      JOIN users u ON u.id = ur.user_id
      JOIN movies m ON m.id = ur.movie_id
      JOIN friendships f ON f.friend_id = ur.user_id
      WHERE f.user_id = ? AND f.status = 'accepted'
      ORDER BY ur.created_at DESC
      LIMIT 50
    `, [userId]);
    
    res.json(feed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении ленты' });
  }
};

// Удалить друга
export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { friendId } = req.params;
    
    const db = await openDB();
    
    // Удаляем обе записи о дружбе (прямую и обратную)
    await db.run(
      'DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );
    
    res.json({ success: true, message: 'Друг удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении друга' });
  }
};
