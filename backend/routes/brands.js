const express = require('express');
const supabase = require('../lib/supabase');
const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('tblbrands').select('*').order('BrandName');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
