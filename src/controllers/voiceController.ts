import { Request, Response } from 'express';
import { supabase } from '../services/database-mock';
import { mockTextToSpeech as textToSpeech, mockSpeechToText as speechToText, mockGetAvailableVoices as getAvailableVoices } from '../services/mock-services';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const receiveVoiceInput = async (req: AuthRequest, res: Response) => {
  try {
    const { audioUrl, useElevenLabs } = req.body;
    const agentId = req.user?.id;

    if (!audioUrl) {
      return res.status(400).json({ error: 'audioUrl is required' });
    }

    // For MVP, we'll simulate the speech-to-text conversion
    // In production, this would download audio from audioUrl and process it
    const transcript = 'Yes, tell her it\'s confirmed and I\'ll be there early.';

    // Store voice session
    const { data: voiceSession, error } = await supabase
      .from('voice_sessions')
      .insert([{
        agent_id: agentId,
        audio_url: audioUrl,
        transcript: transcript,
        status: 'completed'
      }])
      .select()
      .single();

    if (error) {
      console.error('Voice session storage error:', error);
      return res.status(500).json({ error: 'Failed to store voice session' });
    }

    res.json({
      sessionId: voiceSession.id,
      transcript: transcript,
      status: 'completed'
    });
  } catch (error) {
    console.error('Voice input error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateVoiceResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await textToSpeech(text, voiceId);

    // In a real application, you'd save this to cloud storage and return a URL
    // For MVP, we'll return the audio as base64
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      audioData: `data:audio/mpeg;base64,${audioBase64}`,
      text: text
    });
  } catch (error) {
    console.error('Voice response generation error:', error);
    res.status(500).json({ error: 'Failed to generate voice response' });
  }
};

export const getVoices = async (req: Request, res: Response) => {
  try {
    const voices = await getAvailableVoices();
    res.json({ voices });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
};

export const processAudioFile = async (req: AuthRequest, res: Response) => {
  try {
    // This would be used with multer middleware to handle file uploads
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioBuffer = req.file.buffer;
    const transcript = await speechToText(audioBuffer);

    res.json({
      transcript: transcript,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({ error: 'Failed to process audio file' });
  }
};

export const getVoiceSessions = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;

    const { data: sessions, error } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch voice sessions' });
    }

    res.json({ sessions });
  } catch (error) {
    console.error('Get voice sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};