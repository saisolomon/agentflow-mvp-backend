import { Router } from 'express';
import multer from 'multer';
import { 
  receiveVoiceInput, 
  generateVoiceResponse, 
  getVoices, 
  processAudioFile,
  getVoiceSessions 
} from '../controllers/voiceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/receive-input', receiveVoiceInput);
router.post('/generate-response', generateVoiceResponse);
router.get('/voices', getVoices);
router.post('/upload', upload.single('audio'), processAudioFile);
router.get('/sessions', getVoiceSessions);

export default router;