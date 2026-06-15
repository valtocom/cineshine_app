import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Feed.css';

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
      const response = await api.get('/friends/feed');
      setFeed(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h2>Лента активности</h2>
        <p className="feed-subtitle">Что смотрят и оценивают ваши друзья</p>
      </div>

      {feed.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет друзей или они ещё ничего не оценили</p>
          <button onClick={() => window.location.href = '/users/search'} className="primary-btn">
            Найти друзей
          </button>
        </div>
      ) : (
        <div className="feed-list">
          {feed.map((item) => (
            <div key={item.id} className="feed-item">
              <div className="feed-avatar">
                <img 
                  src={`https://ui-avatars.com/api/?background=f5c518&color=000&name=${encodeURIComponent(item.user_name)}`} 
                  alt={item.user_name}
                />
              </div>
              <div className="feed-content">
                <div className="feed-text">
                  <strong>{item.user_name}</strong> оценил(а) фильм{' '}
                  <strong>«{item.movie_title}»</strong> на <span className="feed-rating">{item.rating}/5</span>
                </div>
                <div className="feed-date">{formatDate(item.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
