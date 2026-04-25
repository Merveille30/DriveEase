const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// User register
router.post('/register', async (req, res) => {
  try {
    const { fullname, email, mobile, password } = req.body;
    if (!fullname || !email || !mobile || !password)
      return res.status(400).json({ error: 'All fields required' });

    // Use maybeSingle() so no error when row not found
    const { data: existing } = await supabase
      .from('tblusers').select('id').eq('EmailId', email).maybeSingle();
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const { error } = await supabase.from('tblusers').insert({
      FullName: fullname, EmailId: email, ContactNo: mobile, Password: hashed
    });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user } = await supabase
      .from('tblusers').select('*').eq('EmailId', email).maybeSingle();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.EmailId, name: user.FullName, role: 'user' },
      process.env.JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, name: user.FullName, email: user.EmailId } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { data: admin } = await supabase
      .from('admin').select('*').eq('UserName', username).maybeSingle();
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.Password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, username: admin.UserName, role: 'admin' },
      process.env.JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: admin.id, username: admin.UserName, role: 'admin' } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check email availability
router.get('/check-email', async (req, res) => {
  const { email } = req.query;
  const { data } = await supabase.from('tblusers').select('id').eq('EmailId', email).maybeSingle();
  res.json({ available: !data });
});

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data } = await supabase.from('tblusers').select('*').eq('id', req.user.id).maybeSingle();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullname, mobile, dob, address, city, country } = req.body;
    const { error } = await supabase.from('tblusers').update({
      FullName: fullname, ContactNo: mobile, dob, Address: address, City: city, Country: country
    }).eq('id', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: user } = await supabase.from('tblusers').select('Password').eq('id', req.user.id).maybeSingle();
    const valid = await bcrypt.compare(currentPassword, user.Password);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from('tblusers').update({ Password: hashed }).eq('id', req.user.id);
    res.json({ message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, mobile, newPassword } = req.body;
    const { data: user } = await supabase
      .from('tblusers').select('id').eq('EmailId', email).eq('ContactNo', mobile).maybeSingle();
    if (!user) return res.status(404).json({ error: 'No account found with that email and mobile' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from('tblusers').update({ Password: hashed }).eq('id', user.id);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
