import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { formatCurrency } from '../lib/currency';

const STATUS = {
  0: { label: 'Pending Review', cls: 'status-pending', msg: 'Your booking is awaiting admin confirmation.', icon: '⏳' },
  1: { label: 'Confirmed', cls: 'status-confirmed', msg: 'Your booking has been confirmed! Enjoy your ride.', icon: '✅' },
  2: { label: 'Cancelled', cls: 'status-cancelled', msg: 'This booking was cancelled.', icon: '❌' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(r => { setBookings(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const calcDays = (from, to) => Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000));

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
      </div>

      <section className="section">
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚗</div>
            <h3 style={{ color: 'var(--dark)', marginBottom: '0.5rem', fontWeight: 700 }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't made any bookings. Browse our fleet and find your perfect car.</p>
            <Link to="/cars" className="btn btn-primary btn-lg">Browse Cars →</Link>
          </div>
        ) : (
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((b, i) => {
              const days = calcDays(b.FromDate, b.ToDate);
              const total = days * (b.tblvehicles?.PricePerDay || 0);
              const { label, cls, msg, icon } = STATUS[b.Status] || { label: 'Unknown', cls: '', msg: '', icon: '?' };
              const imgSrc = b.tblvehicles?.Vimage1
                ? (b.tblvehicles.Vimage1.startsWith('http') ? b.tblvehicles.Vimage1 : `/api/uploads/${b.tblvehicles.Vimage1}`)
                : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80';

              return (
                <div key={b.id} style={{
                  background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                  display: 'grid', gridTemplateColumns: '200px 1fr auto',
                  overflow: 'hidden', transition: 'var(--transition)',
                }}>
                  {/* Car Image */}
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={imgSrc}
                      alt={b.tblvehicles?.VehiclesTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '140px' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'; }}
                    />
                    <span className={cls} style={{ position: 'absolute', top: '10px', left: '10px' }}>{label}</span>
                  </div>

                  {/* Booking Info */}
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ color: 'var(--dark)', fontWeight: 700, fontSize: '1.05rem' }}>
                        {b.tblvehicles?.VehiclesTitle || 'Vehicle'}
                      </h3>
                      {b.tblvehicles?.tblbrands?.BrandName && (
                        <span style={{ background: 'var(--gray-2)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '100px' }}>
                          {b.tblvehicles.tblbrands.BrandName}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      Booking #{b.BookingNumber}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>From</div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>{b.FromDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>To</div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>{b.ToDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Duration</div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>{days} day{days !== 1 ? 's' : ''}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Rate</div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>{formatCurrency(b.tblvehicles?.PricePerDay)}/day</div>
                      </div>
                    </div>
                    {b.message && (
                      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        "{b.message}"
                      </p>
                    )}
                    {/* Status message */}
                    <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500,
                      background: b.Status === 1 ? '#d1fae5' : b.Status === 2 ? '#fee2e2' : '#fef3c7',
                      color: b.Status === 1 ? '#065f46' : b.Status === 2 ? '#991b1b' : '#92400e',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      {icon} {msg}
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ padding: '1.25rem 1.5rem', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '130px', background: 'var(--gray)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Total</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em' }}>{formatCurrency(total)}</div>
                    <Link to={`/cars/${b.VehicleId}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>View Car</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
