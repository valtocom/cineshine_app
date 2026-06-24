import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Recommendations.css';

interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  poster_url?: string;
  avg_rating: number;
  ratings_count: number;
}

const Recommendations: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moviesRes, ratingsRes] = await Promise.all([
        api.get('/movies/recommendations/hybrid'),
        api.get('/movies/user/ratings')
      ]);
      
      setMovies(moviesRes.data);
      
      const ratingsMap: Record<number, number> = {};
      ratingsRes.data.forEach((r: any) => {
        ratingsMap[r.movie_id] = r.rating;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rateMovie = async (movieId: number, rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Сохраняем старую оценку пользователя
      const oldRating = userRatings[movieId] || 0;
      
      // Отправляем оценку на сервер
      await api.post('/movies/rate', { movieId, rating });
      
      // Обновляем состояние оценки пользователя
      setUserRatings(prev => ({ ...prev, [movieId]: rating }));
      
      // Обновляем средний рейтинг у этого фильма локально
      setMovies(prevMovies => 
        prevMovies.map(movie => {
          if (movie.id === movieId) {
            let newAvg = movie.avg_rating;
            let newCount = movie.ratings_count;
            
            if (oldRating === 0) {
              // Если оценки не было — добавляем новую
              newCount = movie.ratings_count + 1;
              newAvg = ((movie.avg_rating * movie.ratings_count) + rating) / newCount;
            } else {
              // Если оценка была — заменяем старую на новую
              newAvg = ((movie.avg_rating * movie.ratings_count) - oldRating + rating) / movie.ratings_count;
            }
            
            return {
              ...movie,
              avg_rating: newAvg,
              ratings_count: newCount
            };
          }
          return movie;
        })
      );
      
    } catch (err) {
      console.error('Ошибка при оценке:', err);
    }
  };

  const openMovie = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h2>Рекомендации для вас</h2>
        <p className="recommendations-subtitle">
          Фильмы, подобранные на основе ваших оценок и предпочтений друзей
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="empty-state">
          <p>Поставьте оценки фильмам, чтобы получить персональные рекомендации</p>
          <button onClick={() => navigate('/movies')} className="primary-btn">
            Оценить фильмы
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {movies.map((movie) => {
            const userRating = userRatings[movie.id] || 0;
            return (
              <div key={movie.id} className="movie-card" onClick={() => openMovie(movie.id)}>
                <div className="movie-card__poster">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} />
                  ) : (
                    <div className="poster-placeholder">🎬</div>
                  )}
                </div>
                <div className="movie-card__info">
                  <h3 className="movie-card__title">{movie.title}</h3>
                  <p className="movie-card__year">{movie.genre} • {movie.year}</p>
                  <div className="movie-card__rating">
                    <span className="rating-stars">⭐ {movie.avg_rating?.toFixed(1) || '0'}</span>
                    <span className="rating-count">({movie.ratings_count})</span>
                  </div>
                  <div className="movie-card__rate" onClick={(e) => e.stopPropagation()}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`rate-btn ${userRating === star ? 'active' : ''}`}
                        onClick={(e) => rateMovie(movie.id, star, e)}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
