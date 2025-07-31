const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://agentflow-mvp.vercel.app', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Mock user data
const mockUser = {
  id: '1',
  email: 'jim.agent@realestate.com',
  name: 'Jim Rodriguez',
  phone: '+1 (555) 123-4567'
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AgentFlow MVP API is running',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  if (email === 'jim.agent@realestate.com' && password === 'password123') {
    res.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Profile endpoint
app.get('/api/auth/profile', (req, res) => {
  res.json({ user: mockUser });
});

// Mock messages endpoint
app.get('/api/messages', (req, res) => {
  res.json({
    messages: [
      {
        id: '1',
        from: 'buyer@example.com',
        subject: 'Property Inquiry',
        content: 'Hi Jim, I\'m interested in the 3BR house on Oak Street.',
        timestamp: new Date().toISOString(),
        thread_id: 'thread-1'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple AgentFlow API server running on port ${PORT}`);
  console.log(`📊 Mock login: jim.agent@realestate.com / password123`);
});