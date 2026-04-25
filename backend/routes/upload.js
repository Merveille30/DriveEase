const express = require('express');
const multer = require('multer');
const supabase = require('../lib/supabase');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Store file in memory so we can upload to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filename = `vehicle-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) return res.status(500).json({ error: error.message });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(filename);

    res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
