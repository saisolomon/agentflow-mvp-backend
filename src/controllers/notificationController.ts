import { Request, Response } from 'express';
import { supabase } from '../services/database-mock';
import { mockSendSMS as sendSMS, mockMakeCall as makeCall } from '../services/mock-services';
import { AuthRequest } from '../middleware/auth';

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { type, message, urgency } = req.body;
    const agentId = req.user?.id;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type and message are required' });
    }

    // Get agent's phone number
    const { data: agent, error } = await supabase
      .from('users')
      .select('phone, name')
      .eq('id', agentId)
      .single();

    if (error || !agent || !agent.phone) {
      return res.status(404).json({ error: 'Agent phone number not found' });
    }

    let success = false;
    let method = '';

    switch (type) {
      case 'sms':
        success = await sendSMS(agent.phone, message);
        method = 'SMS';
        break;
        
      case 'call':
        success = await makeCall(agent.phone, message, agent.name);
        method = 'Voice Call';
        break;
        
      case 'push':
        // TODO: Implement push notifications
        console.log(`📮 Push notification: ${message}`);
        success = true;
        method = 'Push Notification';
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }

    if (success) {
      res.json({
        message: `Notification sent successfully via ${method}`,
        type,
        urgency: urgency || 'medium'
      });
    } else {
      res.status(500).json({ error: `Failed to send ${method}` });
    }
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // For MVP, return default preferences
    // TODO: Store in database
    const preferences = {
      highUrgency: ['call', 'sms'],
      mediumUrgency: ['sms'],
      lowUrgency: ['push'],
      workingHours: {
        start: '08:00',
        end: '20:00',
        timezone: 'America/New_York'
      }
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { preferences } = req.body;
    const userId = req.user?.id;

    // TODO: Store preferences in database
    console.log(`Updated notification preferences for user ${userId}:`, preferences);

    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};