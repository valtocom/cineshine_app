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
  ratings_count: number;
}

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    fetchUserRatings();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies');
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const res = await api.get('/user/ratings');
      const ratingsMap: Record<number, number> = {};
      res.data.forEach((r: any) => {
        ratingsMap[r.movie_id] = r.rating;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const rateMovie = async (movieId: number, rating: number, e: React.MouseEvent) => {
    e.stopPropagation(); // чтобы не открывалась страница фильма
    try {
      await api.post('/movies/rate', { movieId, rating });
      setUserRatings({ ...userRatings, [movieId]: rating });
      fetchMovies();
    } catch (err) {
      console.error(err);
    }
  };

  const openMovie = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  if (loading) return <div className="form-container">Загрузка фильмов...</div>;

  return (
    <div>
      <h2>Каталог фильмов</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => openMovie(movie.id)}>
            <div className="movie-card__poster">
              {movie.poster_url ? (
                <img src={movie.poster_url} alt={movie.title} />
              ) : (
                <div style={{ background: '#333', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🎬
                </div>
              )}
            </div>
            <div className="movie-card__info">
              <h3 className="movie-card__title">{movie.title}</h3>
              <p className="movie-card__year">{movie.genre} • {movie.year}</p>
              <div className="movie-card__rating">
                <span>⭐ {movie.avg_rating?.toFixed(1) || '0'}</span>
                <span>({movie.ratings_count || 0} оценок)</span>
              </div>
              <div className="movie-card__rate" onClick={(e) => e.stopPropagation()}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={(e) => rateMovie(movie.id, star, e)}
                    className={userRatings[movie.id] === star ? 'active' : ''}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
