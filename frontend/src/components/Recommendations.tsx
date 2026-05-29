import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../api';

const Recommendations: React.FC = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const response = await getRecommendations();
      setMovies(response.data);
    };
    fetchRecommendations();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '50px auto', padding: 20 }}>
      <h2>Рекомендации для вас</h2>
      <button onClick={() => navigate('/profile')} style={{ marginBottom: 20 }}>Назад в профиль</button>
      <div>
        {movies.map((movie) => (
          <div key={movie.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 10, borderRadius: 8 }}>
            <h3>{movie.title}</h3>
            <p>Жанр: {movie.genre} | Год: {movie.year}</p>
            <p><strong>Средний рейтинг:</strong> {movie.avg_rating ? movie.avg_rating.toFixed(1) : movie.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
