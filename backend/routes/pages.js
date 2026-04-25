const express = require('express');
const supabase = require('../lib/supabase');
const router = express.Router();

router.get('/:type', async (req, res) => {
  const { data, error } = await supabase
    .from('tblpages').select('*').eq('type', req.params.type).maybeSingle();
  if (!data) return res.status(404).json({ error: 'Page not found' });
  res.json(data);
});

module.exports = router;
