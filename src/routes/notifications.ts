import { Router } from 'express';
import { sendNotification, getNotificationPreferences, updateNotificationPreferences } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/send', sendNotification);
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);

export default router;