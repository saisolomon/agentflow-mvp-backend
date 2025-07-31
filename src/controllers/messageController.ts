import { Request, Response } from 'express';
import { supabase } from '../services/database-mock';
import { generateMessageReply, analyzeMessageUrgency } from '../services/openai-mock';
import { AuthRequest } from '../middleware/auth';

export const receiveIncomingMessage = async (req: Request, res: Response) => {
  try {
    const { contactId, message, channel, timestamp } = req.body;

    if (!contactId || !message || !channel) {
      return res.status(400).json({ error: 'contactId, message, and channel are required' });
    }

    // Analyze urgency
    const urgency = await analyzeMessageUrgency(message);

    // Store message
    const { data: messageData, error } = await supabase
      .from('messages')
      .insert([{
        contact_id: contactId,
        content: message,
        channel,
        direction: 'inbound',
        urgency,
        status: 'pending',
        created_at: timestamp || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Message storage error:', error);
      return res.status(500).json({ error: 'Failed to store message' });
    }

    // TODO: Trigger notification based on urgency
    if (urgency === 'high') {
      // Trigger immediate call to agent
      console.log(`🚨 High urgency message from contact ${contactId}: ${message}`);
    }

    res.status(201).json({
      message: 'Message received successfully',
      data: messageData,
      urgency
    });
  } catch (error) {
    console.error('Incoming message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateReply = async (req: AuthRequest, res: Response) => {
  try {
    const { contactId, tone, voiceInput, context, channel } = req.body;
    const agentId = req.user?.id;

    if (!contactId || !voiceInput || !channel) {
      return res.status(400).json({ error: 'contactId, voiceInput, and channel are required' });
    }

    // Get contact and agent information
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const { data: agent, error: agentError } = await supabase
      .from('users')
      .select('name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('content, direction')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(5);

    const lastClientMessage = recentMessages?.find(m => m.direction === 'inbound')?.content || '';

    // Generate reply
    const draft = await generateMessageReply(
      agent.name,
      contact.name,
      contact.role,
      context || contact.property_info || 'Property details not available',
      lastClientMessage,
      voiceInput,
      tone || 'casual'
    );

    res.json({ draft });
  } catch (error) {
    console.error('Generate reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.query;
    const userId = req.user?.id;

    let query = supabase
      .from('messages')
      .select(`
        *,
        contacts(name, role)
      `)
      .order('created_at', { ascending: false });

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    // Only get messages for contacts belonging to this user
    query = query.eq('contacts.user_id', userId);

    const { data: messages, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};