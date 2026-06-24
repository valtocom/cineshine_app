import { Router } from 'express';
import { 
  getMovies, 
  getMovieById, 
  getUserRating,
  getUserRatings,
  rateMovie, 
  getRecommendations,
  getHybridRecommendations 
} from '../controllers/movieController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/user/ratings', authMiddleware, getUserRatings);
router.get('/recommendations/hybrid', authMiddleware, getHybridRecommendations);
router.get('/recommendations', authMiddleware, getRecommendations);
router.post('/rate', authMiddleware, rateMovie);

router.get('/:id/rating', authMiddleware, getUserRating);
router.get('/:id', getMovieById);

router.get('/', getMovies);

export default router;
