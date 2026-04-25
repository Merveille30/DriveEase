import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const ACCESSORIES = [
  ['airConditioner', 'Air Conditioner'], ['powerDoorLocks', 'Power Door Locks'],
  ['abs', 'ABS'], ['brakeAssist', 'Brake Assist'], ['powerSteering', 'Power Steering'],
  ['driverAirbag', 'Driver Airbag'], ['passengerAirbag', 'Passenger Airbag'],
  ['powerWindows', 'Power Windows'], ['cdPlayer', 'CD Player'],
  ['centralLocking', 'Central Locking'], ['crashSensor', 'Crash Sensor'], ['leatherSeats', 'Leather Seats'],
];

const empty = { title: '', brand: '', overview: '', price: '', fuelType: 'Petrol', modelYear: new Date().getFullYear(), seating: 5, imageUrl: '' };

function getImg(url) {
  if (!url) return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80';
  return url.startsWith('http') ? url : `/api/uploads/${url}`;
}
export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [accessories, setAccessories] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => api.get('/admin/vehicles').then(r => setVehicles(r.data)).catch(() => {});

  useEffect(() => {
    load();
    api.get('/brands').then(r => setBrands(r.data)).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditing(null); setForm(empty); setAccessories({});
    setImageFile(null); setImagePreview(''); setShowForm(true);
  };

  const openEdit = v => {
    setEditing(v.id);
    setForm({
      title: v.VehiclesTitle || '', brand: v.VehiclesBrand || '',
      overview: v.VehiclesOverview || '', price: v.PricePerDay || '',
      fuelType: v.FuelType || 'Petrol', modelYear: v.ModelYear || '',
      seating: v.SeatingCapacity || 5, imageUrl: v.Vimage1 || '',
    });
    setAccessories({
      airConditioner: !!v.AirConditioner, powerDoorLocks: !!v.PowerDoorLocks,
      abs: !!v.AntiLockBrakingSystem, brakeAssist: !!v.BrakeAssist,
      powerSteering: !!v.PowerSteering, driverAirbag: !!v.DriverAirbag,
      passengerAirbag: !!v.PassengerAirbag, powerWindows: !!v.PowerWindows,
      cdPlayer: !!v.CDPlayer, centralLocking: !!v.CentralLocking,
      crashSensor: !!v.CrashSensor, leatherSeats: !!v.LeatherSeats,
    });
    setImageFile(null);
    setImagePreview(v.Vimage1 ? getImg(v.Vimage1) : '');
    setShowForm(true);
  };

  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImageFile(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file, file.name);

      const response = await api.post('/upload', fd);
      const { url } = response.data;

      setForm(f => ({ ...f, imageUrl: url }));
      setImagePreview(url);
      setImageFile(null);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Upload failed — try pasting a URL instead');
      // Keep local preview so user can still see what they selected
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (uploading) return toast.error('Please wait for image to finish uploading');
    try {
      const payload = {
        title: form.title, brand: form.brand, overview: form.overview,
        price: form.price, fuelType: form.fuelType, modelYear: form.modelYear,
        seating: form.seating, imageUrl: form.imageUrl || '',
        ...accessories,
      };
      if (editing) {
        await api.put(`/admin/vehicles/${editing}`, payload);
        toast.success('Vehicle updated');
      } else {
        await api.post('/admin/vehicles', payload);
        toast.success('Vehicle added');
      }
      setShowForm(false); setEditing(null); setForm(empty);
      setAccessories({}); setImageFile(null); setImagePreview('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this vehicle?')) return;
    await api.delete(`/admin/vehicles/${id}`);
    toast.success('Deleted'); load();
  };

  const previewSrc = imagePreview || form.imageUrl || '';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d1117', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Vehicles</h1>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>{vehicles.length} vehicles in fleet</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 700, color: '#0d1117', fontSize: '1.1rem' }}>
            {editing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Vehicle Title</label>
                <input required placeholder="e.g. Toyota Fortuner 2022" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <select required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.BrandName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price Per Day (USD)</label>
                <input type="number" required placeholder="e.g. 150" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fuel Type</label>
                <select value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value })}>
                  {['Petrol', 'Diesel', 'CNG', 'Electric'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Model Year</label>
                <input type="number" required placeholder="e.g. 2022" value={form.modelYear} onChange={e => setForm({ ...form, modelYear: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Seating Capacity</label>
                <input type="number" required placeholder="e.g. 5" value={form.seating} onChange={e => setForm({ ...form, seating: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Overview / Description</label>
              <textarea rows={3} placeholder="Describe the vehicle..." value={form.overview} onChange={e => setForm({ ...form, overview: e.target.value })} />
            </div>

            {/* Image section */}
            <div style={{ marginBottom: '1.25rem', padding: '1.25rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Vehicle Image
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem' }}>Option 1: Upload from computer</p>
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    disabled={uploading}
                    style={{ fontSize: '0.85rem', padding: '0.4rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', width: '100%', background: '#fff' }} />
                  {uploading && (
                    <p style={{ fontSize: '0.8rem', color: '#e63946', marginTop: '0.4rem', fontWeight: 600 }}>
                      ⏳ Uploading image...
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem' }}>Option 2: Paste image URL</p>
                  <input type="url" placeholder="https://example.com/car.jpg"
                    value={form.imageUrl}
                    onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setImagePreview(e.target.value); setImageFile(null); }}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              {(imagePreview || form.imageUrl) && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', color: '#718096', marginBottom: '0.4rem' }}>
                    Preview: {uploading ? '(uploading...)' : '✓ Ready'}
                  </p>
                  <img
                    src={imagePreview || form.imageUrl}
                    alt="preview"
                    style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e63946' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* Accessories */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Accessories & Features
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {ACCESSORIES.map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.4rem 0.75rem', background: accessories[key] ? 'rgba(230,57,70,0.08)' : '#f8f9fa', border: `1.5px solid ${accessories[key] ? 'rgba(230,57,70,0.3)' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', color: accessories[key] ? '#e63946' : '#2d3748', fontWeight: accessories[key] ? 600 : 400 }}>
                    <input type="checkbox" checked={!!accessories[key]} onChange={e => setAccessories({ ...accessories, [key]: e.target.checked })} style={{ display: 'none' }} />
                    {accessories[key] ? '✓' : '+'} {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={uploading}>
                {uploading ? '⏳ Uploading image...' : editing ? 'Save Changes' : 'Add Vehicle'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {vehicles.map(v => (
          <div key={v.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {/* Image */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
              <img src={getImg(v.Vimage1)} alt={v.VehiclesTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'; }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(13,17,23,0.75)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '100px' }}>
                {v.tblbrands?.BrandName || 'Unknown'}
              </div>
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#e63946', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '100px' }}>
                ${Number(v.PricePerDay).toLocaleString()}/day
              </div>
            </div>
            {/* Info */}
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: '#0d1117', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{v.VehiclesTitle}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span style={{ background: '#f0f2f5', color: '#718096', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '100px' }}>⛽ {v.FuelType}</span>
                <span style={{ background: '#f0f2f5', color: '#718096', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '100px' }}>📅 {v.ModelYear}</span>
                <span style={{ background: '#f0f2f5', color: '#718096', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '100px' }}>👥 {v.SeatingCapacity} seats</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(v)}>Edit</button>
                <button className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(v.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
          <h3 style={{ color: '#0d1117', marginBottom: '0.5rem' }}>No vehicles yet</h3>
          <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Add your first vehicle to the fleet.</p>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
        </div>
      )}
    </div>
  );
}
