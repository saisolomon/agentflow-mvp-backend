// Mock OpenAI service for testing without API key

export const mockGenerateMessageReply = async (
  agentName: string,
  contactName: string,
  contactRole: string,
  propertyInfo: string,
  clientMessage: string,
  voiceInput: string,
  tone: 'casual' | 'formal' = 'casual'
): Promise<string> => {
  
  console.log('🤖 Mock OpenAI: Generating reply...');
  console.log(`   Agent: ${agentName}`);
  console.log(`   Contact: ${contactName} (${contactRole})`);
  console.log(`   Client said: "${clientMessage}"`);
  console.log(`   Agent voice input: "${voiceInput}"`);
  
  // Generate realistic replies based on common real estate scenarios
  const replies = {
    inspection: `Hi ${contactName}! Yes, the inspection is still on for 3 PM. I'll actually be there a few minutes early to make sure everything's set up. Looking forward to seeing you there!`,
    showing: `Hi ${contactName}! Absolutely, I can schedule a showing for this weekend. How does Saturday at 2 PM work for you? Let me know and I'll get everything arranged.`,
    default: `Hi ${contactName}! Thanks for reaching out. ${voiceInput.replace(/tell her|tell him|say/gi, 'I wanted to let you know that')}. Please let me know if you have any other questions!`
  };
  
  let reply = replies.default;
  
  if (clientMessage.toLowerCase().includes('inspection')) {
    reply = replies.inspection;
  } else if (clientMessage.toLowerCase().includes('showing') || clientMessage.toLowerCase().includes('schedule')) {
    reply = replies.showing;
  }
  
  // Add agent's personal touch based on voice input
  if (voiceInput.toLowerCase().includes('early')) {
    reply = reply.replace('Looking forward to seeing you there!', "I'll be there a bit early to make sure everything is ready. Looking forward to seeing you!");
  }
  
  console.log(`   Generated reply: "${reply}"`);
  return reply;
};

export const mockAnalyzeMessageUrgency = async (message: string): Promise<'low' | 'medium' | 'high'> => {
  console.log('🔍 Mock OpenAI: Analyzing urgency...');
  
  const highUrgencyKeywords = ['urgent', 'asap', 'emergency', 'now', 'immediately', 'where are you', 'still on', 'cancelled'];
  const mediumUrgencyKeywords = ['today', 'tomorrow', 'schedule', 'reschedule', 'time', 'when'];
  
  const lowerMessage = message.toLowerCase();
  
  if (highUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    console.log('   → HIGH urgency detected');
    return 'high';
  } else if (mediumUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    console.log('   → MEDIUM urgency detected');
    return 'medium';
  } else {
    console.log('   → LOW urgency detected');
    return 'low';
  }
};