import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Watchlist.css';

interface WatchlistItem {
  id: number;
  movie_id: number;
  title: string;
  year: number;
  poster_url?: string;
  added_at: string;
}

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get('/watchlist');
      setWatchlist(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    try {
      await api.delete(`/watchlist/${movieId}`);
      setWatchlist(watchlist.filter(item => item.movie_id !== movieId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h2>Буду смотреть</h2>
        <p className="watchlist-subtitle">Фильмы, которые вы планируете посмотреть</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p>Список пуст</p>
          <button onClick={() => navigate('/movies')} className="primary-btn">
            Перейти к фильмам
          </button>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-card" onClick={() => navigate(`/movies/${item.movie_id}`)}>
              <div className="watchlist-card__poster">
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.title} />
                ) : (
                  <div className="poster-placeholder">🎬</div>
                )}
              </div>
              <div className="watchlist-card__info">
                <h3 className="watchlist-card__title">{item.title}</h3>
                <p className="watchlist-card__year">{item.year}</p>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(item.movie_id);
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
