import { Router } from 'express';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  getFriends, 
  getPendingRequests, 
  getFriendsFeed 
} from '../controllers/friendController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/request', sendFriendRequest);
router.put('/request/:requestId/accept', acceptFriendRequest);
router.put('/request/:requestId/decline', declineFriendRequest);
router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.get('/feed', getFriendsFeed);

export default router;
