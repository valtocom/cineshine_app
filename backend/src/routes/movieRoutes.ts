import { Router } from 'express';
import { getMovies, rateMovie, getRecommendations } from '../controllers/movieController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getMovies);
router.post('/rate', authMiddleware, rateMovie);
router.get('/recommendations', authMiddleware, getRecommendations);

export default router;
