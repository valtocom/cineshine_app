import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

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
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchMovie();
    fetchUserRating();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при загрузке фильма');
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

  const rateMovie = async (rating: number) => {
    try {
      await api.post('/movies/rate', { movieId: id, rating });
      setUserRating(rating);
      fetchMovie(); // обновить средний рейтинг
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="form-container">Загрузка...</div>;
  if (error) return <div className="form-container error">{error}</div>;
  if (!movie) return <div className="form-container">Фильм не найден</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="secondary" style={{ marginBottom: '20px' }}>
        ← Назад
      </button>
      <div className="movie-detail">
        <div className="movie-detail__poster">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} />
          ) : (
            <div style={{ background: '#333', width: '100%', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🎬
            </div>
          )}
        </div>
        <div className="movie-detail__info">
          <h1 className="movie-detail__title">{movie.title}</h1>
          <div className="movie-detail__meta">{movie.genre} • {movie.year}</div>
          <p className="movie-detail__description">{movie.description || 'Описание отсутствует'}</p>
          <div className="movie-detail__rating">
            ⭐ {movie.avg_rating?.toFixed(1) || '0'} ({movie.ratings_count || 0} оценок)
          </div>
          <div className="movie-card__rate" style={{ marginTop: '20px' }}>
            <strong>Ваша оценка: </strong>
            <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => rateMovie(star)}
                  style={{
                    background: userRating === star ? '#ffc107' : '#333',
                    color: userRating === star ? '#000' : '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
