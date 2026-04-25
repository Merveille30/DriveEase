import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';
import { formatCurrency } from '../lib/currency';
import toast from 'react-hot-toast';

const ACCESSORIES = [
  ['AirConditioner', 'Air Conditioner'], ['PowerDoorLocks', 'Power Door Locks'],
  ['AntiLockBrakingSystem', 'ABS'], ['BrakeAssist', 'Brake Assist'],
  ['PowerSteering', 'Power Steering'], ['DriverAirbag', 'Driver Airbag'],
  ['PassengerAirbag', 'Passenger Airbag'], ['PowerWindows', 'Power Windows'],
  ['CDPlayer', 'CD Player'], ['CentralLocking', 'Central Locking'],
  ['CrashSensor', 'Crash Sensor'], ['LeatherSeats', 'Leather Seats'],
];

export default function CarDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [booking, setBooking] = useState({ fromDate: '', toDate: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(r => setCar(r.data));
    api.get(`/vehicles/${id}/similar`).then(r => setSimilar(r.data));
  }, [id]);

  if (!car) return <div className="loading"><div className="spinner" /></div>;

  const images = [car.Vimage1, car.Vimage2, car.Vimage3, car.Vimage4, car.Vimage5].filter(Boolean);
  const getImg = img => img?.startsWith('http') ? img : `/api/uploads/${img}`;

  const handleBook = async e => {
    e.preventDefault();
    if (!user) return toast.error('Please login to book a car');
    if (user.role === 'admin') return toast.error('Switch to a user account to make bookings');
    setLoading(true);
    try {
      await api.post('/bookings', { vehicleId: id, ...booking });
      toast.success('Booking successful!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>{car.VehiclesTitle}</h1>
        <p>{car.tblbrands?.BrandName} · {car.ModelYear}</p>
      </div>
      <div className="vehicle-detail">
        {/* Left: Images + Tabs */}
        <div>
          <img
            src={images[activeImg] ? getImg(images[activeImg]) : 'https://placehold.co/800x500?text=No+Image'}
            alt={car.VehiclesTitle}
            style={{ width: '100%', borderRadius: '12px', marginBottom: '0.5rem', height: '380px', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://placehold.co/800x500?text=No+Image'; }}
          />
          <div className="thumb-row">
            {images.map((img, i) => (
              <img key={i} src={getImg(img)} className={activeImg === i ? 'active' : ''}
                onClick={() => setActiveImg(i)} alt=""
                onError={e => { e.target.src = 'https://placehold.co/80x60?text=img'; }}
              />
            ))}
          </div>

          {/* Tabs */}
          <div style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
              {['overview', 'accessories'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer',
                    fontWeight: 600, color: activeTab === tab ? '#e94560' : '#666',
                    borderBottom: activeTab === tab ? '2px solid #e94560' : '2px solid transparent',
                    marginBottom: '-2px', textTransform: 'capitalize' }}>
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === 'overview' ? (
              <p style={{ color: '#555', lineHeight: 1.7 }}>{car.VehiclesOverview}</p>
            ) : (
              <div className="accessories">
                {ACCESSORIES.map(([key, label]) => (
                  <span key={key} className={`badge ${car[key] ? 'badge-green' : 'badge-gray'}`}>
                    {car[key] ? '✓' : '✗'} {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info + Booking */}
        <div>
          <div className="vehicle-info">
            <h1>{car.VehiclesTitle}</h1>
            <div className="price">{formatCurrency(car.PricePerDay)}<span style={{ fontSize: '1rem', color: '#999', fontWeight: 400 }}>/day</span></div>
            <div className="spec-grid">
              <div className="spec-item">🏷️ <span>{car.tblbrands?.BrandName}</span></div>
              <div className="spec-item">⛽ <span>{car.FuelType}</span></div>
              <div className="spec-item">📅 <span>{car.ModelYear}</span></div>
              <div className="spec-item">👥 <span>{car.SeatingCapacity} seats</span></div>
            </div>
          </div>

          <div className="booking-form" style={{ marginTop: '1rem' }}>
            <h3>Book This Car</h3>
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>From Date</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={booking.fromDate} onChange={e => setBooking({ ...booking, fromDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input type="date" required min={booking.fromDate || new Date().toISOString().split('T')[0]}
                  value={booking.toDate} onChange={e => setBooking({ ...booking, toDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea rows={3} value={booking.message}
                  onChange={e => setBooking({ ...booking, message: e.target.value })} />
              </div>
              {booking.fromDate && booking.toDate && (
                <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <strong>Total:</strong> {Math.ceil((new Date(booking.toDate) - new Date(booking.fromDate)) / 86400000)} days
                  × {formatCurrency(car.PricePerDay)} = <strong style={{ color: '#e63946' }}>
                    {formatCurrency(Math.ceil((new Date(booking.toDate) - new Date(booking.fromDate)) / 86400000) * car.PricePerDay)}
                  </strong>
                </div>
              )}
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Booking...' : user ? 'Book Now' : 'Login to Book'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Similar Cars */}
      {similar.length > 0 && (
        <section className="section gray-bg">
          <div className="section-header"><h2>Similar <span>Cars</span></h2></div>
          <div className="cars-grid">
            {similar.map(c => <CarCard key={c.id} car={c} />)}
          </div>
        </section>
      )}
    </>
  );
}
