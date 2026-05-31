import { Router } from 'express';
import { 
  getMovies, 
  rateMovie, 
  getRecommendations,
  getHybridRecommendations 
} from '../controllers/movieController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Публичные маршруты
router.get('/', getMovies);

// Защищённые маршруты (требуют авторизации)
router.post('/rate', authMiddleware, rateMovie);
router.get('/recommendations', authMiddleware, getRecommendations);
router.get('/recommendations/hybrid', authMiddleware, getHybridRecommendations);

export default router;
