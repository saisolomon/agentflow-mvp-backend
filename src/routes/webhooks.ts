import { Router } from 'express';
import { handleCRMWebhook, handleTwilioWebhook, handleVoiceRecording } from '../controllers/webhookController';

const router = Router();

// CRM webhook endpoints (no auth required for webhooks)
router.post('/crm/:provider', handleCRMWebhook);

// Twilio webhooks
router.post('/twilio/sms', handleTwilioWebhook);
router.post('/twilio/voice', handleVoiceRecording);

// Generic webhook test endpoint
router.post('/test', (req, res) => {
  console.log('🧪 Test webhook received:', {
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  
  res.json({ 
    message: 'Test webhook received successfully',
    timestamp: new Date().toISOString(),
    data: req.body
  });
});

export default router;