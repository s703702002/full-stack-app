import express from 'express';
import { checkAuthenticated } from '../middlewares/auth.js';
import {
  getFriends,
  getFriendshipStatus,
  getReceivedRequests,
  getSentRequests,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from '../controllers/friendshipController.js';
import validate from '../middlewares/validateMiddleware.js';
import { respondFriendRequestSchema } from '../validators/friendshipValidator.js';

const router = express.Router();

router.use(checkAuthenticated);

router.get('/friends', getFriends);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.get('/status/:targetUserId', getFriendshipStatus);
router.post('/:receiverId', sendFriendRequest);
router.patch(
  '/:requesterId',
  validate(respondFriendRequestSchema),
  respondToFriendRequest,
);
router.delete('/friends/:friendId', removeFriend);

export default router;
