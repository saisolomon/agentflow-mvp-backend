import { Router } from 'express';
import { receiveIncomingMessage, generateReply, getMessages } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Webhook endpoint (no auth required)
router.post('/incoming', receiveIncomingMessage);

// Protected routes
router.use(authenticateToken);
router.post('/generate-reply', generateReply);
router.get('/', getMessages);

export default router;