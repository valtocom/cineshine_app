import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController';

const router = Router();

router.use(authMiddleware);
router.get('/', getWatchlist);
router.post('/:movieId', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);

export default router;
