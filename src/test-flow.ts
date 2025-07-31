#!/usr/bin/env ts-node

/**
 * AgentFlow MVP Test Script
 * 
 * This script demonstrates the complete voice interaction flow:
 * 1. Simulate incoming client message
 * 2. Process with urgency analysis  
 * 3. Generate agent notification
 * 4. Process agent voice response
 * 5. Generate client reply with AI
 */

import { generateMessageReply, analyzeMessageUrgency } from './services/openai';
import { sendSMS } from './services/twilio';
import { textToSpeech } from './services/elevenlabs';

async function testCompleteFlow() {
  console.log('🧪 Testing AgentFlow MVP Complete Voice Interaction Flow\n');

  // Step 1: Simulate incoming client message
  const clientMessage = "Hey just checking — is the inspection still on for 3 PM today?";
  const clientName = "Carla Thomas";
  const agentName = "Jim Anderson";
  
  console.log(`📱 1. Incoming client message from ${clientName}:`);
  console.log(`   "${clientMessage}"\n`);

  // Step 2: Analyze urgency
  console.log('🤖 2. Analyzing message urgency...');
  try {
    const urgency = await analyzeMessageUrgency(clientMessage);
    console.log(`   Urgency level: ${urgency.toUpperCase()}\n`);

    // Step 3: Generate notification based on urgency
    if (urgency === 'high') {
      console.log('🚨 3. High urgency detected - would trigger voice call to agent');
      console.log(`   Call message: "${agentName}, ${clientName} just asked if the inspection is still on for 3 PM. Want me to reply for you?"\n`);
    } else {
      console.log('📲 3. Would send SMS notification to agent\n');
    }

    // Step 4: Simulate agent voice response
    const agentVoiceInput = "Yes, tell her it's confirmed and I'll be there early.";
    console.log('🎙️ 4. Agent responds via voice:');
    console.log(`   "${agentVoiceInput}"\n`);

    // Step 5: Generate AI reply
    console.log('🤖 5. Generating professional reply with AI...');
    const aiReply = await generateMessageReply(
      agentName,
      clientName,
      'buyer',
      '123 Main St. - 3BR/2BA Colonial, inspection scheduled',
      clientMessage,
      agentVoiceInput,
      'casual'
    );
    
    console.log('✅ Generated reply:');
    console.log(`   "${aiReply}"\n`);

    // Step 6: Test voice generation (optional)
    console.log('🔊 6. Testing voice generation...');
    try {
      const audioBuffer = await textToSpeech(
        `Voice test: ${aiReply.substring(0, 50)}...`
      );
      console.log(`✅ Voice audio generated (${audioBuffer.length} bytes)\n`);
    } catch (voiceError) {
      console.log('⚠️  Voice generation test skipped (ElevenLabs API key may be missing)\n');
    }

    // Step 7: Test SMS sending (optional)
    console.log('📱 7. Testing SMS notification...');
    const testPhone = process.env.TEST_PHONE_NUMBER;
    if (testPhone && process.env.TWILIO_ACCOUNT_SID) {
      try {
        await sendSMS(testPhone, `AgentFlow Test: ${aiReply}`);
        console.log('✅ Test SMS sent successfully\n');
      } catch (smsError) {
        console.log('⚠️  SMS test skipped (Twilio credentials may be missing)\n');
      }
    } else {
      console.log('⚠️  SMS test skipped (TEST_PHONE_NUMBER not set)\n');
    }

    console.log('🎉 Complete flow test finished successfully!');
    console.log('\n--- FLOW SUMMARY ---');
    console.log(`Client: "${clientMessage}"`);
    console.log(`Urgency: ${urgency}`);
    console.log(`Agent Voice: "${agentVoiceInput}"`);
    console.log(`AI Reply: "${aiReply}"`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCompleteFlow()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testCompleteFlow };