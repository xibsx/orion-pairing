require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock session storage (replace with Redis in production)
const sessions = new Map();

// API Endpoint: Request OTP
app.post('/api/request-otp', async (req, res) => {
  const { phone } = req.body;

  // Validate phone number
  if (!phone.match(/^\+\d{10,15}$/)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    // In a real implementation, call your WhatsApp bot service here
    const sessionId = `orion-${Date.now().toString(36)}`;
    sessions.set(sessionId, { phone, status: 'pending' });

    // Simulate OTP sending (replace with actual Baileys integration)
    console.log(`[DEBUG] OTP would be sent to ${phone}`);
    
    res.json({ 
      success: true, 
      sessionId,
      message: "OTP sent successfully" 
    });

  } catch (error) {
    console.error("OTP request failed:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// API Endpoint: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { sessionId, otp } = req.body;

  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: "Session expired or invalid" });
  }

  // In production: Validate OTP against WhatsApp servers
  if (otp !== "123456") { // Replace with real verification
    return res.status(401).json({ error: "Invalid OTP" });
  }

  // Mark session as verified
  sessions.get(sessionId).status = 'verified';
  
  res.json({ 
    success: true,
    sessionId,
    message: "Device paired successfully!"
  });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

app.listen(PORT, () => {
  console.log(`Pairing server running on http://localhost:${PORT}`);
});
