import express from 'express';
import { checkAuthenticated } from '../middlewares/auth';
import {
  getFriendshipStatus,
  getReceivedRequests,
  getSentRequests,
  respondToFriendRequest,
  sendFriendRequest,
} from '../controllers/friendshipController';

const router = express.Router();

router.use(checkAuthenticated);

router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.get('/status/:targetUserId', getFriendshipStatus);
router.post('/:receiverId', sendFriendRequest);
router.patch('/:requesterId', respondToFriendRequest);

export default router;
