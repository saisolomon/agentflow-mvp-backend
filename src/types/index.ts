export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'lead';
  status: string;
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  contactId: string;
  agentId: string;
  content: string;
  channel: 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}

export interface Integration {
  id: string;
  userId: string;
  provider: 'gmail' | 'outlook' | 'kvcore' | 'followupboss';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface VoiceSession {
  id: string;
  agentId: string;
  audioUrl: string;
  transcript: string;
  response?: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface NotificationRequest {
  type: 'call' | 'sms' | 'push';
  agentId: string;
  message: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface MessageGenerationRequest {
  agentId: string;
  contactId: string;
  tone: 'casual' | 'formal';
  voiceInput?: string;
  context?: string;
  channel: 'sms' | 'email';
}