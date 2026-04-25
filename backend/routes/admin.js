const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabase');
const { adminMiddleware } = require('../middleware/auth');
const { onBookingStatusChanged } = require('../lib/notify');
const router = express.Router();

// Dashboard stats
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [users, vehicles, bookings, brands, subscribers, queries, testimonials] = await Promise.all([
      supabase.from('tblusers').select('id', { count: 'exact', head: true }),
      supabase.from('tblvehicles').select('id', { count: 'exact', head: true }),
      supabase.from('tblbooking').select('id', { count: 'exact', head: true }),
      supabase.from('tblbrands').select('id', { count: 'exact', head: true }),
      supabase.from('tblsubscribers').select('id', { count: 'exact', head: true }),
      supabase.from('tblcontactusquery').select('id', { count: 'exact', head: true }),
      supabase.from('tbltestimonial').select('id', { count: 'exact', head: true }),
    ]);
    res.json({
      users: users.count || 0, vehicles: vehicles.count || 0,
      bookings: bookings.count || 0, brands: brands.count || 0,
      subscribers: subscribers.count || 0, queries: queries.count || 0,
      testimonials: testimonials.count || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- BOOKINGS ---
router.get('/bookings', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('tblbooking').select('*').order('id', { ascending: false });
    if (status !== undefined && status !== '') query = query.eq('Status', parseInt(status));

    const { data: bookings, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    if (!bookings || bookings.length === 0) return res.json([]);

    // Manual join vehicles
    const vehicleIds = [...new Set(bookings.map(b => b.VehicleId).filter(Boolean))];
    let vehiclesMap = {};
    if (vehicleIds.length > 0) {
      const { data: vehicles } = await supabase
        .from('tblvehicles').select('id, VehiclesTitle, PricePerDay, Vimage1').in('id', vehicleIds);
      (vehicles || []).forEach(v => { vehiclesMap[v.id] = v; });
    }

    // Manual join users
    const emails = [...new Set(bookings.map(b => b.userEmail).filter(Boolean))];
    let usersMap = {};
    if (emails.length > 0) {
      const { data: users } = await supabase
        .from('tblusers').select('EmailId, FullName, ContactNo, Address, City, Country').in('EmailId', emails);
      (users || []).forEach(u => { usersMap[u.EmailId] = u; });
    }

    const result = bookings.map(b => ({
      ...b,
      tblvehicles: vehiclesMap[b.VehicleId] || null,
      user: usersMap[b.userEmail] || null
    }));
    res.json(result);
  } catch (err) {
    console.error('Admin bookings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bookings/:id', adminMiddleware, async (req, res) => {
  try {
    const { data: booking, error } = await supabase
      .from('tblbooking').select('*').eq('id', req.params.id).maybeSingle();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const { data: vehicle } = await supabase
      .from('tblvehicles').select('id, VehiclesTitle, PricePerDay, Vimage1, VehiclesBrand')
      .eq('id', booking.VehicleId).maybeSingle();

    let brand = null;
    if (vehicle?.VehiclesBrand) {
      const { data: b } = await supabase.from('tblbrands').select('BrandName').eq('id', vehicle.VehiclesBrand).maybeSingle();
      brand = b;
    }

    const { data: user } = await supabase
      .from('tblusers').select('FullName, EmailId, ContactNo, Address, City, Country')
      .eq('EmailId', booking.userEmail).maybeSingle();

    res.json({
      ...booking,
      tblvehicles: vehicle ? { ...vehicle, tblbrands: brand } : null,
      user: user || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/bookings/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const { error } = await supabase.from('tblbooking')
      .update({ Status: status, LastUpdationDate: new Date().toISOString() })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    // Fire notifications + emails in background
    const { data: booking } = await supabase.from('tblbooking').select('*').eq('id', req.params.id).maybeSingle();
    if (booking) {
      const { data: vehicle } = await supabase.from('tblvehicles')
        .select('id, VehiclesTitle, PricePerDay').eq('id', booking.VehicleId).maybeSingle();
      const { data: user } = booking.userEmail
        ? await supabase.from('tblusers').select('FullName, EmailId').eq('EmailId', booking.userEmail).maybeSingle()
        : { data: null };
      onBookingStatusChanged(booking, vehicle, user, status).catch(() => {});
    }

    res.json({ message: 'Booking status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- VEHICLES ---
router.get('/vehicles', adminMiddleware, async (req, res) => {
  try {
    const { data: vehicles } = await supabase.from('tblvehicles').select('*').order('id', { ascending: false });
    if (!vehicles || vehicles.length === 0) return res.json([]);

    const brandIds = [...new Set(vehicles.map(v => v.VehiclesBrand).filter(Boolean))];
    let brandsMap = {};
    if (brandIds.length > 0) {
      const { data: brands } = await supabase.from('tblbrands').select('id, BrandName').in('id', brandIds);
      (brands || []).forEach(b => { brandsMap[b.id] = b; });
    }
    res.json(vehicles.map(v => ({ ...v, tblbrands: brandsMap[v.VehiclesBrand] || null })));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/vehicles', adminMiddleware, async (req, res) => {
  try {
    const b = req.body;
    const { error, data } = await supabase.from('tblvehicles').insert({
      VehiclesTitle: b.title,
      VehiclesBrand: parseInt(b.brand),
      VehiclesOverview: b.overview,
      PricePerDay: parseFloat(b.price),
      FuelType: b.fuelType,
      ModelYear: parseInt(b.modelYear),
      SeatingCapacity: parseInt(b.seating),
      Vimage1: b.imageUrl || null,
      AirConditioner: b.airConditioner ? 1 : null,
      PowerDoorLocks: b.powerDoorLocks ? 1 : null,
      AntiLockBrakingSystem: b.abs ? 1 : null,
      BrakeAssist: b.brakeAssist ? 1 : null,
      PowerSteering: b.powerSteering ? 1 : null,
      DriverAirbag: b.driverAirbag ? 1 : null,
      PassengerAirbag: b.passengerAirbag ? 1 : null,
      PowerWindows: b.powerWindows ? 1 : null,
      CDPlayer: b.cdPlayer ? 1 : null,
      CentralLocking: b.centralLocking ? 1 : null,
      CrashSensor: b.crashSensor ? 1 : null,
      LeatherSeats: b.leatherSeats ? 1 : null,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/vehicles/:id', adminMiddleware, async (req, res) => {
  try {
    const b = req.body;
    const updateData = {
      VehiclesTitle: b.title,
      VehiclesBrand: parseInt(b.brand),
      VehiclesOverview: b.overview,
      PricePerDay: parseFloat(b.price),
      FuelType: b.fuelType,
      ModelYear: parseInt(b.modelYear),
      SeatingCapacity: parseInt(b.seating),
      AirConditioner: b.airConditioner ? 1 : null,
      PowerDoorLocks: b.powerDoorLocks ? 1 : null,
      AntiLockBrakingSystem: b.abs ? 1 : null,
      BrakeAssist: b.brakeAssist ? 1 : null,
      PowerSteering: b.powerSteering ? 1 : null,
      DriverAirbag: b.driverAirbag ? 1 : null,
      PassengerAirbag: b.passengerAirbag ? 1 : null,
      PowerWindows: b.powerWindows ? 1 : null,
      CDPlayer: b.cdPlayer ? 1 : null,
      CentralLocking: b.centralLocking ? 1 : null,
      CrashSensor: b.crashSensor ? 1 : null,
      LeatherSeats: b.leatherSeats ? 1 : null,
    };
    // Only update image if a new one was provided
    if (b.imageUrl) updateData.Vimage1 = b.imageUrl;
    const { error } = await supabase.from('tblvehicles').update(updateData).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Vehicle updated' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/vehicles/:id', adminMiddleware, async (req, res) => {
  await supabase.from('tblvehicles').delete().eq('id', req.params.id);
  res.json({ message: 'Vehicle deleted' });
});

// --- BRANDS ---
router.get('/brands', adminMiddleware, async (req, res) => {
  const { data } = await supabase.from('tblbrands').select('*').order('BrandName');
  res.json(data || []);
});
router.post('/brands', adminMiddleware, async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('tblbrands').insert({ BrandName: name });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Brand created' });
});
router.put('/brands/:id', adminMiddleware, async (req, res) => {
  await supabase.from('tblbrands').update({ BrandName: req.body.name }).eq('id', req.params.id);
  res.json({ message: 'Brand updated' });
});
router.delete('/brands/:id', adminMiddleware, async (req, res) => {
  await supabase.from('tblbrands').delete().eq('id', req.params.id);
  res.json({ message: 'Brand deleted' });
});

// --- USERS ---
router.get('/users', adminMiddleware, async (req, res) => {
  const { data } = await supabase.from('tblusers').select('id, FullName, EmailId, ContactNo, City, Country, RegDate').order('id', { ascending: false });
  res.json(data || []);
});

// --- TESTIMONIALS ---
router.get('/testimonials', adminMiddleware, async (req, res) => {
  const { data } = await supabase.from('tbltestimonial').select('*').order('id', { ascending: false });
  if (!data) return res.json([]);
  const emails = [...new Set(data.map(t => t.UserEmail).filter(Boolean))];
  let usersMap = {};
  if (emails.length > 0) {
    const { data: users } = await supabase.from('tblusers').select('EmailId, FullName').in('EmailId', emails);
    (users || []).forEach(u => { usersMap[u.EmailId] = u; });
  }
  res.json(data.map(t => ({ ...t, user: usersMap[t.UserEmail] || null })));
});
router.put('/testimonials/:id/status', adminMiddleware, async (req, res) => {
  await supabase.from('tbltestimonial').update({ status: req.body.status }).eq('id', req.params.id);
  res.json({ message: 'Updated' });
});

// --- QUERIES ---
router.get('/queries', adminMiddleware, async (req, res) => {
  const { data } = await supabase.from('tblcontactusquery').select('*').order('id', { ascending: false });
  res.json(data || []);
});

// --- SUBSCRIBERS ---
router.get('/subscribers', adminMiddleware, async (req, res) => {
  const { data } = await supabase.from('tblsubscribers').select('*').order('id', { ascending: false });
  res.json(data || []);
});

// --- ADMIN PASSWORD ---
router.put('/change-password', adminMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: admin } = await supabase.from('admin').select('Password').eq('id', req.user.id).maybeSingle();
    const valid = await bcrypt.compare(currentPassword, admin.Password);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from('admin').update({ Password: hashed }).eq('id', req.user.id);
    res.json({ message: 'Password changed' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
