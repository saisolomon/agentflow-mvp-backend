import { Router } from 'express';
import { connectIntegration, getIntegrations, disconnectIntegration } from '../controllers/integrationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/connect', connectIntegration);
router.get('/', getIntegrations);
router.delete('/:integrationId', disconnectIntegration);

export default router;