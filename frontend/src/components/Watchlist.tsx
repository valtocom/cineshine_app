import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface WatchlistItem {
  id: number;
  movie_id: number;
  title: string;
  year: number;
  poster_url?: string;
}

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get('/watchlist');
      setWatchlist(response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    try {
      await api.delete(`/watchlist/${movieId}`);
      setWatchlist(watchlist.filter(item => item.movie_id !== movieId));
    } catch (err) {
      setError('Ошибка при удалении');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Буду смотреть</h2>
      {error && <div className="error">{error}</div>}
      {watchlist.length === 0 ? (
        <p>Список пуст. Добавьте фильмы из каталога!</p>
      ) : (
        <div className="watchlist-list">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-item">
              <div>
                <h3>{item.title}</h3>
                <p>{item.year}</p>
              </div>
              <button onClick={() => removeFromWatchlist(item.movie_id)} className="secondary">
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
