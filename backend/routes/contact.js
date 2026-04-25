const express = require('express');
const supabase = require('../lib/supabase');
const router = express.Router();

// Get contact info
router.get('/info', async (req, res) => {
  const { data } = await supabase.from('tblcontactusinfo').select('*').maybeSingle();
  res.json(data);
});

// Submit contact query
router.post('/query', async (req, res) => {
  const { name, email, phone, message } = req.body;
  const { error } = await supabase.from('tblcontactusquery').insert({
    name, EmailId: email, ContactNumber: phone, Message: message, status: 0
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Query submitted successfully' });
});

// Subscribe newsletter
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.from('tblsubscribers').insert({ SubscriberEmail: email });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Subscribed successfully' });
});

module.exports = router;
