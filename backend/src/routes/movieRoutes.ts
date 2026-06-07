import { Router } from 'express';
import { 
  getMovies, 
  getMovieById, 
  getUserRating,
  rateMovie, 
  getRecommendations,
  getHybridRecommendations 
} from '../controllers/movieController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Публичные маршруты
router.get('/', getMovies);
router.get('/:id', getMovieById);

// Защищённые маршруты
router.get('/:id/rating', authMiddleware, getUserRating);
router.post('/rate', authMiddleware, rateMovie);
router.get('/recommendations', authMiddleware, getRecommendations);
router.get('/recommendations/hybrid', authMiddleware, getHybridRecommendations);

export default router;
