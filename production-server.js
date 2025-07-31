const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const USE_MOCK = !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY;
let supabase;
let openai;

if (USE_MOCK) {
  console.log('🧪 Using MOCK services for development');
  // Mock database
  const mockUsers = [
    {
      id: '1',
      email: 'jim.agent@realestate.com',
      name: 'Jim Rodriguez',
      phone: '+1 (555) 123-4567',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password123
    }
  ];
  
  supabase = {
    from: (table) => ({
      select: () => ({ eq: () => ({ single: () => ({ data: mockUsers[0] }) }) }),
      insert: (data) => ({ data: [{ ...data, id: Date.now().toString() }] }),
      update: (data) => ({ eq: () => ({ data: [data] }) })
    })
  };
} else {
  console.log('🔗 Using real Supabase database');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('🤖 OpenAI API connected');
} else {
  console.log('🧪 Using mock OpenAI responses');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AgentFlow Production API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: USE_MOCK ? 'mock' : 'supabase',
      ai: process.env.OPENAI_API_KEY ? 'openai' : 'mock'
    }
  });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = USE_MOCK ? 
      password === 'password123' : 
      await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name,
        phone: phone || null,
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      message: 'User created successfully',
      user: { email, name }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Messages endpoints
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    // Mock message data for now
    const messages = [
      {
        id: '1',
        from: 'buyer@example.com',
        subject: 'Property Inquiry',
        content: 'Hi Jim, I\'m interested in the 3BR house on Oak Street.',
        timestamp: new Date().toISOString(),
        thread_id: 'thread-1',
        urgency: 'high'
      },
      {
        id: '2',
        from: 'seller@example.com',
        subject: 'Listing Update',
        content: 'Can we schedule a showing for this weekend?',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        thread_id: 'thread-2',
        urgency: 'medium'
      }
    ];

    res.json({ messages });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages/generate-reply', authenticateToken, async (req, res) => {
  try {
    const { contactId, tone, voiceInput, channel } = req.body;

    let reply;
    
    if (openai) {
      // Use real OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional real estate agent assistant. Convert casual voice input into professional client communications."
          },
          {
            role: "user",
            content: `Convert this voice input into a professional ${channel} message: "${voiceInput}"`
          }
        ],
        max_tokens: 150
      });
      
      reply = completion.choices[0].message.content;
    } else {
      // Mock response
      reply = `Hi! Yes, the inspection is confirmed for 3 PM today. I'll be there a few minutes early to meet you. Looking forward to it!`;
    }

    res.json({
      success: true,
      draft: reply,
      metadata: {
        tone,
        channel,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Reply generation error:', error);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
});

// Notifications endpoints
app.post('/api/notifications/send', authenticateToken, async (req, res) => {
  try {
    const { type, message } = req.body;
    
    // Mock notification - in production would use Twilio
    console.log(`📱 MOCK ${type.toUpperCase()} NOTIFICATION:`, message);
    
    res.json({
      success: true,
      message: `${type} notification sent successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Notification failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AgentFlow Production API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'configured' : 'using fallback'}`);
});