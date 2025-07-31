import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    console.log(`📱 SMS sent to ${to}: ${message}`);
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
};

export const makeCall = async (
  to: string, 
  message: string,
  agentName: string = 'Agent'
): Promise<boolean> => {
  try {
    // Create TwiML for the voice message
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">${agentName}, ${message}</Say>
      <Record maxLength="30" timeout="5" recordingStatusCallback="/api/voice/recording-callback" />
    </Response>`;

    await client.calls.create({
      twiml: twiml,
      to: to,
      from: twilioPhoneNumber
    });
    
    console.log(`📞 Call initiated to ${to}: ${message}`);
    return true;
  } catch (error) {
    console.error('Call error:', error);
    return false;
  }
};

export const sendWhatsApp = async (to: string, message: string): Promise<boolean> => {
  try {
    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`
    });
    console.log(`💬 WhatsApp sent to ${to}: ${message}`);
    return true;
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    return false;
  }
};