import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MovieList.css';

interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  poster_url?: string;
  avg_rating: number;
  ratings_count: number;
}

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      // Загружаем фильмы
      const moviesRes = await api.get('/movies');
      setMovies(moviesRes.data);
      
      // Загружаем оценки — ПРАВИЛЬНЫЙ ПУТЬ!
      const ratingsRes = await api.get('/movies/user/ratings');
      console.log('📊 Оценки с бэкенда:', ratingsRes.data);
      
      const ratingsMap: Record<number, number> = {};
      ratingsRes.data.forEach((r: any) => {
        ratingsMap[r.movie_id] = r.rating;
      });
      
      console.log('📊 Карта оценок:', ratingsMap);
      setUserRatings(ratingsMap);
      
    } catch (err) {
      console.error('❌ Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rateMovie = async (movieId: number, rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post('/movies/rate', { movieId, rating });
      setUserRatings(prev => ({ ...prev, [movieId]: rating }));
      const res = await api.get('/movies');
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openMovie = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="movies-page">
      <div className="movies-header">
        <h2>Фильмы</h2>
        <p className="movies-subtitle">Открывай и оценивай любимое кино</p>
      </div>

      <div className="movies-grid">
        {movies.map((movie) => {
          const userRating = userRatings[movie.id] || 0;
          return (
            <div key={movie.id} className="movie-card" onClick={() => openMovie(movie.id)}>
              <div className="movie-card__poster">
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt={movie.title} />
                ) : (
                  <span>🎬</span>
                )}
              </div>
              <div className="movie-card__info">
                <div className="movie-card__title">{movie.title}</div>
                <div className="movie-card__year">{movie.genre} • {movie.year}</div>
                <div className="movie-card__rating-row">
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
    </div>
  );
};

export default MovieList;
