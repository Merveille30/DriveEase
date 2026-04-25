require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check — no DB needed
app.get('/', (req, res) => res.json({ message: 'DriveEase API v1.0.0', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV || 'unknown',
  supabase: !!process.env.SUPABASE_URL,
  resend: !!process.env.RESEND_API_KEY,
  time: new Date().toISOString(),
}));

// Load routes — wrapped in try/catch so we can see which one fails
try {
  app.use('/api/auth', require('./routes/auth'));
} catch(e) { console.error('auth route failed:', e.message); }

try {
  app.use('/api/vehicles', require('./routes/vehicles'));
} catch(e) { console.error('vehicles route failed:', e.message); }

try {
  app.use('/api/bookings', require('./routes/bookings'));
} catch(e) { console.error('bookings route failed:', e.message); }

try {
  app.use('/api/brands', require('./routes/brands'));
} catch(e) { console.error('brands route failed:', e.message); }

try {
  app.use('/api/contact', require('./routes/contact'));
} catch(e) { console.error('contact route failed:', e.message); }

try {
  app.use('/api/admin', require('./routes/admin'));
} catch(e) { console.error('admin route failed:', e.message); }

try {
  app.use('/api/pages', require('./routes/pages'));
} catch(e) { console.error('pages route failed:', e.message); }

try {
  app.use('/api/upload', require('./routes/upload'));
} catch(e) { console.error('upload route failed:', e.message); }

try {
  app.use('/api/notifications', require('./routes/notifications'));
} catch(e) { console.error('notifications route failed:', e.message); }

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(500).json({ error: err.message });
});

// Only listen locally — Vercel handles HTTP in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
}

module.exports = app;
