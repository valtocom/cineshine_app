import { Router } from 'express';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  getFriends, 
  getPendingRequests, 
  getPendingRequestsCount,
  getFriendsFeed,
  removeFriend  // НОВЫЙ ИМПОРТ
} from '../controllers/friendController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/request', sendFriendRequest);
router.put('/request/:requestId/accept', acceptFriendRequest);
router.put('/request/:requestId/decline', declineFriendRequest);
router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.get('/requests/count', getPendingRequestsCount);
router.get('/feed', getFriendsFeed);
router.delete('/:friendId', removeFriend); // НОВЫЙ МАРШРУТ

export default router;
