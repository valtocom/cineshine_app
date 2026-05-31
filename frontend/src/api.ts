import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (email: string, password: string, username: string) =>
  api.post('/auth/register', { email, password, username });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

export const getMovies = () => api.get('/movies');

export const rateMovie = (movieId: number, rating: number) =>
  api.post('/movies/rate', { movieId, rating });

export const getRecommendations = () => api.get('/movies/recommendations');

// Получить гибридные рекомендации
export const getHybridRecommendations = () => api.get('/movies/recommendations/hybrid');

export default api;
