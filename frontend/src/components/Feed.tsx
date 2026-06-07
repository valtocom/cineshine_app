import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface FeedItem {
  id: number;
  user_name: string;
  movie_title: string;
  rating: number;
  created_at: string;
}

const Feed: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await api.get('/friends/feed');
      setFeed(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="form-container">Загрузка ленты...</div>;

  return (
    <div>
      <h2>Лента активности друзей</h2>
      {feed.length === 0 ? (
        <p>Ваши друзья ещё ничего не оценили</p>
      ) : (
        <div className="feed-list">
          {feed.map((item) => (
            <div key={item.id} className="feed-item">
              <p>
                <strong>{item.user_name}</strong> оценил(а) фильм{' '}
                <strong>"{item.movie_title}"</strong> на {item.rating}/5
              </p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
