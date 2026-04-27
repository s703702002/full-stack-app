import express from 'express';
import { checkAuthenticated } from '../middlewares/auth.js';
import { sseStream } from '../utils/sseManager.js';

const router = express.Router();

router.get('/stream', checkAuthenticated, sseStream);

export default router;
