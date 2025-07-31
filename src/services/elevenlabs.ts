import { ElevenLabsApi, play } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsApi({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export const textToSpeech = async (text: string, voiceId?: string): Promise<Buffer> => {
  try {
    const audio = await elevenlabs.generate({
      voice: voiceId || 'Rachel', // Default voice
      text: text,
      model_id: 'eleven_monolingual_v1'
    });

    // Convert audio stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Failed to convert text to speech');
  }
};

export const speechToText = async (audioBuffer: Buffer): Promise<string> => {
  try {
    // Note: ElevenLabs doesn't have direct speech-to-text
    // This would typically use OpenAI Whisper or another STT service
    console.log('Speech-to-text conversion needed - implement with OpenAI Whisper');
    return 'Speech-to-text not implemented yet';
  } catch (error) {
    console.error('Speech-to-text error:', error);
    throw new Error('Failed to convert speech to text');
  }
};

export const getAvailableVoices = async () => {
  try {
    const voices = await elevenlabs.voices.getAll();
    return voices.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category
    }));
  } catch (error) {
    console.error('Get voices error:', error);
    throw new Error('Failed to fetch available voices');
  }
};