import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  poster_url?: string;
  avg_rating: number;
}

const Recommendations: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/recommendations/hybrid');
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div>
      <h2>🔥 Рекомендации для вас</h2>
      <p className="subtitle">На основе ваших оценок и предпочтений друзей</p>
      
      {movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <p>Поставьте оценки фильмам, чтобы получить рекомендации</p>
          <button onClick={() => navigate('/movies')} className="primary-btn">
            Оценить фильмы
          </button>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card" onClick={() => navigate(`/movies/${movie.id}`)}>
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
                  <span>⭐ {movie.avg_rating?.toFixed(1) || '0'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
