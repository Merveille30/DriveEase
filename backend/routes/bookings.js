const express = require('express');
const supabase = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');
const { onBookingCreated } = require('../lib/notify');
const router = express.Router();

// Create booking - any logged in user (not admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, fromDate, toDate, message } = req.body;
    const userEmail = req.user.email;

    if (!vehicleId || !fromDate || !toDate) {
      return res.status(400).json({ error: 'Vehicle, from date and to date are required' });
    }

    // Check date conflict
    const { data: existing } = await supabase
      .from('tblbooking')
      .select('id, FromDate, ToDate')
      .eq('VehicleId', vehicleId)
      .neq('Status', 2);

    const conflict = (existing || []).some(b => {
      const bFrom = new Date(b.FromDate);
      const bTo = new Date(b.ToDate);
      const reqFrom = new Date(fromDate);
      const reqTo = new Date(toDate);
      return reqFrom <= bTo && reqTo >= bFrom;
    });

    if (conflict) return res.status(400).json({ error: 'Car already booked for these dates' });

    const bookingNo = Math.floor(100000000 + Math.random() * 900000000);
    const { error } = await supabase.from('tblbooking').insert({
      BookingNumber: bookingNo,
      userEmail,
      VehicleId: parseInt(vehicleId),
      FromDate: fromDate,
      ToDate: toDate,
      message: message || '',
      Status: 0
    });

    if (error) return res.status(500).json({ error: error.message });

    // Fetch the created booking to get its id
    const { data: newBooking } = await supabase
      .from('tblbooking').select('*').eq('BookingNumber', bookingNo).maybeSingle();

    // Fire notifications + emails in background (don't await — don't block response)
    if (newBooking) {
      const { data: vehicle } = await supabase.from('tblvehicles')
        .select('id, VehiclesTitle, PricePerDay').eq('id', parseInt(vehicleId)).maybeSingle();
      const { data: user } = await supabase.from('tblusers')
        .select('FullName, EmailId').eq('EmailId', userEmail).maybeSingle();
      onBookingCreated(newBooking, vehicle || { VehiclesTitle: 'Vehicle' }, user).catch(() => {});
    }

    res.json({ message: 'Booking successful', bookingNumber: bookingNo });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user bookings - manual join
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('tblbooking')
      .select('*')
      .eq('userEmail', req.user.email)
      .order('id', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    if (!bookings || bookings.length === 0) return res.json([]);

    // Get vehicle ids and fetch vehicles separately
    const vehicleIds = [...new Set(bookings.map(b => b.VehicleId).filter(Boolean))];
    const { data: vehicles } = await supabase
      .from('tblvehicles')
      .select('id, VehiclesTitle, PricePerDay, Vimage1, VehiclesBrand')
      .in('id', vehicleIds);

    const brandIds = [...new Set((vehicles || []).map(v => v.VehiclesBrand).filter(Boolean))];
    let brandsMap = {};
    if (brandIds.length > 0) {
      const { data: brands } = await supabase.from('tblbrands').select('id, BrandName').in('id', brandIds);
      (brands || []).forEach(b => { brandsMap[b.id] = b; });
    }

    const vehiclesMap = {};
    (vehicles || []).forEach(v => {
      vehiclesMap[v.id] = { ...v, tblbrands: brandsMap[v.VehiclesBrand] || null };
    });

    const result = bookings.map(b => ({ ...b, tblvehicles: vehiclesMap[b.VehicleId] || null }));
    res.json(result);
  } catch (err) {
    console.error('My bookings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
