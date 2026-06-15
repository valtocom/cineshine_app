import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MovieDetail.css';

interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  year: number;
  poster_url?: string;
  avg_rating: number;
  ratings_count: number;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchMovie();
    fetchUserRating();
    checkWatchlist();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async () => {
    try {
      const response = await api.get(`/movies/${id}/rating`);
      setUserRating(response.data.rating || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const checkWatchlist = async () => {
    try {
      const response = await api.get('/watchlist');
      const watchlist = response.data;
      setInWatchlist(watchlist.some((item: any) => item.movie_id === parseInt(id!)));
    } catch (err) {
      console.error(err);
    }
  };

  const rateMovie = async (rating: number) => {
    try {
      await api.post('/movies/rate', { movieId: id, rating });
      setUserRating(rating);
      fetchMovie();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/${id}`);
        setInWatchlist(false);
      } else {
        await api.post(`/watchlist/${id}`);
        setInWatchlist(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (!movie) return <div className="empty-state">Фильм не найден</div>;

  return (
    <div className="movie-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>

      <div className="movie-detail-container">
        <div className="movie-poster">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} />
          ) : (
            <div className="poster-placeholder">🎬</div>
          )}
        </div>

        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-meta">{movie.genre} • {movie.year}</div>

          <div className="movie-rating-section">
            <div className="avg-rating">
              <span className="rating-label">Средний рейтинг</span>
              <div>
                <span className="rating-value">⭐ {movie.avg_rating?.toFixed(1) || '0'}</span>
                <span className="rating-count"> ({movie.ratings_count} оценок)</span>
              </div>
            </div>

            <div className="user-rating">
              <span className="rating-label">Ваша оценка</span>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-btn ${userRating >= star ? 'active' : ''}`}
                    onClick={() => rateMovie(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className={`watchlist-btn ${inWatchlist ? 'active' : ''}`}
            onClick={toggleWatchlist}
          >
            {inWatchlist ? '✓ В списке «Буду смотреть»' : '+ Добавить в «Буду смотреть»'}
          </button>

          <div className="movie-description">
            <h3>О фильме</h3>
            <p>{movie.description || 'Описание отсутствует'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
