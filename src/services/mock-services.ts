// Mock services for testing without external APIs

export const mockSendSMS = async (to: string, message: string): Promise<boolean> => {
  console.log(`📱 MOCK SMS to ${to}: ${message}`);
  return true;
};

export const mockMakeCall = async (
  to: string, 
  message: string,
  agentName: string = 'Agent'
): Promise<boolean> => {
  console.log(`📞 MOCK CALL to ${to}:`);
  console.log(`   Message: "${agentName}, ${message}"`);
  return true;
};

export const mockTextToSpeech = async (text: string, voiceId?: string): Promise<Buffer> => {
  console.log(`🔊 MOCK Text-to-Speech: "${text.substring(0, 50)}..."`);
  console.log(`   Voice ID: ${voiceId || 'default'}`);
  // Return a small mock buffer
  return Buffer.from('mock-audio-data');
};

export const mockSpeechToText = async (audioBuffer: Buffer): Promise<string> => {
  console.log(`🎤 MOCK Speech-to-Text: Processing ${audioBuffer.length} bytes`);
  return 'Yes, tell her it\'s confirmed and I\'ll be there early.';
};

export const mockGetAvailableVoices = async () => {
  console.log('🎭 MOCK: Getting available voices');
  return [
    { id: 'rachel', name: 'Rachel', category: 'Professional' },
    { id: 'dave', name: 'Dave', category: 'Friendly' },
    { id: 'bella', name: 'Bella', category: 'Warm' }
  ];
};