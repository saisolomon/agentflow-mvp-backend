import { Request, Response } from 'express';
import { supabase } from '../services/database';
import { analyzeMessageUrgency } from '../services/openai';
import { sendSMS, makeCall } from '../services/twilio';

// Generic webhook handler for CRM systems
export const handleCRMWebhook = async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const payload = req.body;

    console.log(`📨 Received webhook from ${provider}:`, payload);

    switch (provider) {
      case 'followupboss':
        await handleFollowUpBossWebhook(payload);
        break;
      case 'kvcore':
        await handleKvCoreWebhook(payload);
        break;
      case 'hubspot':
        await handleHubSpotWebhook(payload);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported CRM provider' });
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

// Follow Up Boss webhook handler
const handleFollowUpBossWebhook = async (payload: any) => {
  const { event, data } = payload;

  switch (event) {
    case 'person.message.received':
      await processIncomingMessage({
        contactId: data.person.id,
        contactName: data.person.name,
        contactEmail: data.person.email,
        contactPhone: data.person.phone,
        message: data.message.body,
        channel: data.message.type === 'sms' ? 'sms' : 'email',
        source: 'followupboss'
      });
      break;
    
    case 'person.created':
      await processNewContact({
        externalId: data.person.id,
        name: data.person.name,
        email: data.person.email,
        phone: data.person.phone,
        source: 'followupboss'
      });
      break;
  }
};

// kvCORE webhook handler
const handleKvCoreWebhook = async (payload: any) => {
  const { EventType, Data } = payload;

  switch (EventType) {
    case 'ContactMessage':
      await processIncomingMessage({
        contactId: Data.ContactId,
        contactName: Data.ContactName,
        contactEmail: Data.ContactEmail,
        contactPhone: Data.ContactPhone,
        message: Data.MessageBody,
        channel: Data.MessageType === 'SMS' ? 'sms' : 'email',
        source: 'kvcore'
      });
      break;
    
    case 'NewContact':
      await processNewContact({
        externalId: Data.ContactId,
        name: Data.ContactName,
        email: Data.ContactEmail,
        phone: Data.ContactPhone,
        source: 'kvcore'
      });
      break;
  }
};

// HubSpot webhook handler
const handleHubSpotWebhook = async (payload: any) => {
  const { subscriptionType, objectId, propertyName, propertyValue } = payload;

  if (subscriptionType === 'contact.creation') {
    // Handle new contact creation
    console.log('New HubSpot contact created:', objectId);
  } else if (subscriptionType === 'contact.propertyChange' && propertyName === 'last_message') {
    // Handle new message
    await processIncomingMessage({
      contactId: objectId,
      message: propertyValue,
      channel: 'email',
      source: 'hubspot'
    });
  }
};

// Process incoming message from any CRM
const processIncomingMessage = async (params: {
  contactId: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  message: string;
  channel: 'sms' | 'email';
  source: string;
}) => {
  try {
    // Find or create contact in our system
    let contact = await findOrCreateContact(params);
    
    // Analyze message urgency
    const urgency = await analyzeMessageUrgency(params.message);
    
    // Store message
    const { data: messageData, error } = await supabase
      .from('messages')
      .insert([{
        contact_id: contact.id,
        agent_id: contact.user_id,
        content: params.message,
        channel: params.channel,
        direction: 'inbound',
        urgency,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get agent's notification preferences
    const { data: agent } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', contact.user_id)
      .single();

    // Trigger appropriate notification based on urgency
    if (urgency === 'high' && agent?.phone) {
      const callMessage = `${agent.name}, ${params.contactName || 'A client'} just sent an urgent message: "${params.message.substring(0, 100)}..." Want me to help you reply?`;
      await makeCall(agent.phone, callMessage, agent.name);
    } else if ((urgency === 'high' || urgency === 'medium') && agent?.phone) {
      const smsMessage = `🚨 New ${urgency} priority message from ${params.contactName || 'client'}: "${params.message.substring(0, 100)}..." - AgentFlow`;
      await sendSMS(agent.phone, smsMessage);
    }

    console.log(`✅ Processed ${urgency} urgency message from ${params.source}`);
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
};

// Find or create contact in our system
const findOrCreateContact = async (params: {
  contactId: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  source: string;
}) => {
  // First, try to find existing contact by external ID or email/phone
  let { data: existingContact } = await supabase
    .from('contacts')
    .select('*')
    .or(`external_id.eq.${params.contactId},email.eq.${params.contactEmail},phone.eq.${params.contactPhone}`)
    .single();

  if (existingContact) {
    return existingContact;
  }

  // Find the user (agent) who owns this integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('user_id')
    .eq('provider', params.source)
    .eq('is_active', true)
    .single();

  if (!integration) {
    throw new Error(`No active integration found for ${params.source}`);
  }

  // Create new contact
  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert([{
      user_id: integration.user_id,
      external_id: params.contactId,
      name: params.contactName || 'Unknown Contact',
      email: params.contactEmail,
      phone: params.contactPhone,
      role: 'lead',
      status: 'new'
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return newContact;
};

// Process new contact creation
const processNewContact = async (params: {
  externalId: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
}) => {
  try {
    await findOrCreateContact({
      contactId: params.externalId,
      contactName: params.name,
      contactEmail: params.email,
      contactPhone: params.phone,
      source: params.source
    });

    console.log(`✅ Processed new contact from ${params.source}: ${params.name}`);
  } catch (error) {
    console.error('Error processing new contact:', error);
  }
};

// Twilio webhook for SMS/Voice responses
export const handleTwilioWebhook = async (req: Request, res: Response) => {
  try {
    const { From, Body, MessageSid } = req.body;

    console.log(`📱 Received Twilio SMS from ${From}: ${Body}`);

    // Process incoming SMS
    // This would typically match the phone number to a contact
    // and store the message in our system

    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>Thank you for your message. AgentFlow is processing it and will get back to you soon.</Message>
    </Response>`);
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(500).json({ error: 'Failed to process Twilio webhook' });
  }
};

// Voice call recording callback
export const handleVoiceRecording = async (req: Request, res: Response) => {
  try {
    const { RecordingUrl, RecordingSid, CallSid } = req.body;

    console.log(`🎤 Voice recording received: ${RecordingUrl}`);

    // TODO: Process the voice recording with speech-to-text
    // Store the recording and transcript in voice_sessions table

    res.json({ message: 'Recording processed successfully' });
  } catch (error) {
    console.error('Voice recording processing error:', error);
    res.status(500).json({ error: 'Failed to process voice recording' });
  }
};