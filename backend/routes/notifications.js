const express = require('express');
const supabase = require('../lib/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get notifications for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tblnotifications')
      .select('*')
      .eq('userEmail', req.user.email)
      .order('createdAt', { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const { count } = await supabase
      .from('tblnotifications')
      .select('id', { count: 'exact', head: true })
      .eq('userEmail', req.user.email)
      .eq('isRead', false);
    res.json({ count: count || 0 });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await supabase
      .from('tblnotifications')
      .update({ isRead: true })
      .eq('userEmail', req.user.email);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark one as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await supabase
      .from('tblnotifications')
      .update({ isRead: true })
      .eq('id', req.params.id)
      .eq('userEmail', req.user.email);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get all notifications (for admin panel)
router.get('/admin', adminMiddleware, async (req, res) => {
  try {
    const { data } = await supabase
      .from('tblnotifications')
      .select('*')
      .eq('userEmail', 'admin')
      .order('createdAt', { ascending: false })
      .limit(30);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/unread-count', adminMiddleware, async (req, res) => {
  try {
    const { count } = await supabase
      .from('tblnotifications')
      .select('id', { count: 'exact', head: true })
      .eq('userEmail', 'admin')
      .eq('isRead', false);
    res.json({ count: count || 0 });
  } catch (err) {
    res.json({ count: 0 });
  }
});

router.put('/admin/read-all', adminMiddleware, async (req, res) => {
  try {
    await supabase.from('tblnotifications').update({ isRead: true }).eq('userEmail', 'admin');
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
