import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateMessageReply = async (
  agentName: string,
  contactName: string,
  contactRole: string,
  propertyInfo: string,
  clientMessage: string,
  voiceInput: string,
  tone: 'casual' | 'formal' = 'casual'
): Promise<string> => {
  try {
    const systemPrompt = `You are AgentFlow, an AI executive assistant built for real estate agents. You work for ${agentName}, a busy real estate professional.

Your job:
- Draft messages
- Match ${agentName}'s tone
- Prioritize urgent matters
- Offer useful suggestions
- Be discreet and accurate

Speak as if you are the agent. Never say you are AI.`;

    const userPrompt = `CRM Context:
- Contact: ${contactName}
- Role: ${contactRole}
- Property: ${propertyInfo}

Client Message: "${clientMessage}"
Voice Input: "${voiceInput}"

Generate a ${tone}, professional ${tone === 'casual' ? 'text message' : 'email'} ${agentName} would send.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Unable to generate response';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate message reply');
  }
};

export const analyzeMessageUrgency = async (message: string): Promise<'low' | 'medium' | 'high'> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze the urgency of this real estate client message. Return only: low, medium, or high'
        },
        {
          role: 'user',
          content: `Message: "${message}"`
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const urgency = response.choices[0]?.message?.content?.toLowerCase().trim();
    return (urgency === 'high' || urgency === 'medium' || urgency === 'low') ? urgency : 'medium';
  } catch (error) {
    console.error('Urgency analysis error:', error);
    return 'medium';
  }
};