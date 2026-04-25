const express = require('express');
const supabase = require('../lib/supabase');
const router = express.Router();

async function attachBrands(vehicles) {
  if (!vehicles || vehicles.length === 0) return vehicles || [];
  const brandIds = [...new Set(vehicles.map(v => v.VehiclesBrand).filter(Boolean))];
  let brandsMap = {};
  if (brandIds.length > 0) {
    const { data: brands } = await supabase.from('tblbrands').select('id, BrandName').in('id', brandIds);
    (brands || []).forEach(b => { brandsMap[b.id] = b; });
  }
  return vehicles.map(v => ({ ...v, tblbrands: brandsMap[v.VehiclesBrand] || null }));
}

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const { brand, fuel, search, limit } = req.query;
    let query = supabase.from('tblvehicles').select('*').order('id', { ascending: false });
    if (brand) query = query.eq('VehiclesBrand', brand);
    if (fuel) query = query.eq('FuelType', fuel);
    if (search) query = query.ilike('VehiclesTitle', `%${search}%`);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    const result = await attachBrands(data);
    res.json(result);
  } catch (err) {
    console.error('Vehicles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tblvehicles').select('*').eq('id', req.params.id).maybeSingle();
    if (!data) return res.status(404).json({ error: 'Vehicle not found' });
    const [result] = await attachBrands([data]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get similar vehicles
router.get('/:id/similar', async (req, res) => {
  try {
    const { data: vehicle } = await supabase
      .from('tblvehicles').select('VehiclesBrand').eq('id', req.params.id).maybeSingle();
    if (!vehicle) return res.json([]);
    const { data } = await supabase
      .from('tblvehicles').select('*')
      .eq('VehiclesBrand', vehicle.VehiclesBrand)
      .neq('id', req.params.id).limit(4);
    const result = await attachBrands(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
