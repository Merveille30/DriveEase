import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../lib/currency';

const STATUS = {
  0: { label: 'Pending', cls: 'status-pending' },
  1: { label: 'Confirmed', cls: 'status-confirmed' },
  2: { label: 'Cancelled', cls: 'status-cancelled' },
};

function BookingDetailModal({ booking, onClose, onStatusChange }) {
  const calcDays = (from, to) => Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000));
  const days = calcDays(booking.FromDate, booking.ToDate);
  const total = days * (booking.tblvehicles?.PricePerDay || 0);  const imgSrc = booking.tblvehicles?.Vimage1?.startsWith('http')
    ? booking.tblvehicles.Vimage1
    : booking.tblvehicles?.Vimage1
      ? `/api/uploads/${booking.tblvehicles.Vimage1}`
      : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '680px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: '#0d1117', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Booking #{booking.BookingNumber}</h2>
            <span className={STATUS[booking.Status]?.cls}>{STATUS[booking.Status]?.label}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Car Info */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Vehicle</h4>
            <img src={imgSrc} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.75rem' }}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80'; }} />
            <p style={{ fontWeight: 700, color: '#0d1117', fontSize: '1rem' }}>{booking.tblvehicles?.VehiclesTitle}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
              {[
                ['From', booking.FromDate],
                ['To', booking.ToDate],
                ['Duration', `${days} day${days !== 1 ? 's' : ''}`],
                ['Rate', `${formatCurrency(booking.tblvehicles?.PricePerDay)}/day`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ fontWeight: 600, color: '#0d1117', fontSize: '0.875rem', marginTop: '0.15rem' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#0d1117' }}>Total Amount</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e63946' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Client Info */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Client Details</h4>
            {booking.user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  ['👤 Name', booking.user.FullName],
                  ['📧 Email', booking.user.EmailId],
                  ['📞 Phone', booking.user.ContactNo || '—'],
                  ['📍 Address', booking.user.Address || '—'],
                  ['🏙 City', booking.user.City || '—'],
                  ['🌍 Country', booking.user.Country || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #f0f2f5' }}>
                    <span style={{ fontSize: '0.8rem', color: '#718096', minWidth: '90px' }}>{k}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0d1117' }}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '1rem', textAlign: 'center', color: '#718096', fontSize: '0.875rem' }}>
                <p>📧 {booking.userEmail}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>User profile not found</p>
              </div>
            )}

            {booking.message && (
              <div style={{ marginTop: '1rem', background: '#f8f9fa', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Message from client</div>
                <p style={{ fontSize: '0.875rem', color: '#2d3748', fontStyle: 'italic' }}>"{booking.message}"</p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {booking.Status !== 1 && (
                <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  onClick={() => onStatusChange(booking.id, 1)}>
                  ✓ Confirm Booking
                </button>
              )}
              {booking.Status !== 2 && (
                <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  onClick={() => onStatusChange(booking.id, 2)}>
                  ✕ Cancel Booking
                </button>
              )}
              {booking.Status === 1 && (
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  onClick={() => onStatusChange(booking.id, 0)}>
                  ↩ Set Back to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    const q = filter !== '' ? `?status=${filter}` : '';
    api.get(`/admin/bookings${q}`)
      .then(r => { setBookings(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      toast.success(status === 1 ? '✓ Booking confirmed!' : status === 2 ? 'Booking cancelled' : 'Status updated');
      setSelected(prev => prev ? { ...prev, Status: status } : null);
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const calcDays = (from, to) => Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000));

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.Status === 0).length,
    confirmed: bookings.filter(b => b.Status === 1).length,
    cancelled: bookings.filter(b => b.Status === 2).length,
  };

  return (
    <>
      {selected && (
        <BookingDetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d1117', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Bookings</h1>
        <p style={{ color: '#718096', fontSize: '0.9rem' }}>Manage all car rental reservations</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { val: '', label: 'All', count: counts.all },
          { val: '0', label: 'Pending', count: counts.pending },
          { val: '1', label: 'Confirmed', count: counts.confirmed },
          { val: '2', label: 'Cancelled', count: counts.cancelled },
        ].map(tab => (
          <button key={tab.val} onClick={() => setFilter(tab.val)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid',
            borderColor: filter === tab.val ? '#e63946' : '#e2e8f0',
            background: filter === tab.val ? 'rgba(230,57,70,0.08)' : '#fff',
            color: filter === tab.val ? '#e63946' : '#718096',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {tab.label}
            <span style={{ background: filter === tab.val ? '#e63946' : '#f0f2f5', color: filter === tab.val ? '#fff' : '#718096', borderRadius: '100px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: 700 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#0d1117', marginBottom: '0.5rem' }}>No bookings found</h3>
          <p style={{ color: '#718096' }}>No bookings match the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookings.map(b => {
            const days = calcDays(b.FromDate, b.ToDate);
            const total = days * (b.tblvehicles?.PricePerDay || 0);
            const { label, cls } = STATUS[b.Status] || { label: 'Unknown', cls: '' };
            const imgSrc = b.tblvehicles?.Vimage1?.startsWith('http')
              ? b.tblvehicles.Vimage1
              : b.tblvehicles?.Vimage1
                ? `/api/uploads/${b.tblvehicles.Vimage1}`
                : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80';

            return (
              <div key={b.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: '120px 1fr auto', overflow: 'hidden', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}>

                {/* Car image */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '110px' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80'; }} />
                </div>

                {/* Info */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0d1117', fontSize: '0.95rem' }}>{b.tblvehicles?.VehiclesTitle || 'Vehicle'}</span>
                    <span className={cls}>{label}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.6rem' }}>
                    #{b.BookingNumber} · {b.user?.FullName || b.userEmail}
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>📅 {b.FromDate} → {b.ToDate}</span>
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>⏱ {days} day{days !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e63946' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center', borderLeft: '1px solid #f0f2f5', minWidth: '160px' }}>
                  <button className="btn btn-sm" style={{ background: '#f8f9fa', color: '#0d1117', border: '1px solid #e2e8f0', justifyContent: 'center' }}
                    onClick={() => setSelected(b)}>
                    View Details
                  </button>
                  {b.Status !== 1 && (
                    <button className="btn btn-sm btn-success" style={{ justifyContent: 'center' }}
                      onClick={() => updateStatus(b.id, 1)}>
                      ✓ Confirm
                    </button>
                  )}
                  {b.Status !== 2 && (
                    <button className="btn btn-sm btn-danger" style={{ justifyContent: 'center' }}
                      onClick={() => updateStatus(b.id, 2)}>
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
