import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHybridRecommendations } from '../api';

interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  avg_rating: number;
  rating_count?: number;
  weighted_score?: number;
  genre_match?: number;
}

const Recommendations: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await getHybridRecommendations();
        setMovies(response.data);
        setError('');
      } catch (err) {
        setError('Ошибка при загрузке рекомендаций');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Загрузка рекомендаций...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '50px auto', padding: 20 }}>
      <h2>🔥 Гибридные рекомендации для вас</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Рекомендации основаны на оценках ваших друзей, ваших любимых жанрах и мнении похожих пользователей
      </p>
      <button onClick={() => navigate('/profile')} style={{ marginBottom: 20, padding: '8px 16px', cursor: 'pointer' }}>
        ← Назад в профиль
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {movies.map((movie) => (
          <div key={movie.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>{movie.title}</h3>
            <p style={{ color: '#666', marginBottom: 8 }}>{movie.genre} · {movie.year}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#f5c518' }}>
                ⭐ {movie.avg_rating ? movie.avg_rating.toFixed(1) : 'Нет оценок'}
              </span>
              {movie.weighted_score && (
                <span style={{ fontSize: 14, color: '#888' }}>
                  вес: {movie.weighted_score.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
