import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies, rateMovie } from '../api';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      const response = await getMovies();
      setMovies(response.data);
    };
    fetchMovies();
  }, []);

  const handleRate = async (movieId: number, rating: number) => {
    await rateMovie(movieId, rating);
    setRatings({ ...ratings, [movieId]: rating });
  };

  return (
    <div style={{ maxWidth: 800, margin: '50px auto', padding: 20 }}>
      <h2>Каталог фильмов</h2>
      <button onClick={() => navigate('/profile')} style={{ marginBottom: 20 }}>Назад в профиль</button>
      <div>
        {movies.map((movie) => (
          <div key={movie.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 10, borderRadius: 8 }}>
            <h3>{movie.title}</h3>
            <p>Жанр: {movie.genre} | Год: {movie.year}</p>
            <div>
              <strong>Оценка: </strong>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(movie.id, star)}
                  style={{
                    margin: '0 3px',
                    padding: '5px 10px',
                    backgroundColor: (ratings[movie.id] === star || movie.userRating === star) ? '#ffc107' : '#e9ecef',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
