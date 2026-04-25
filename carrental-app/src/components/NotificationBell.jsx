import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const TYPE_COLORS = {
  success: '#10b981',
  error: '#ef4444',
  booking: '#6366f1',
  info: '#3b82f6',
};

export default function NotificationBell({ isAdmin = false }) {  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const endpoint = isAdmin ? '/notifications/admin' : '/notifications';
      const countEndpoint = isAdmin ? '/notifications/admin/unread-count' : '/notifications/unread-count';
      const [notifRes, countRes] = await Promise.all([
        api.get(endpoint),
        api.get(countEndpoint),
      ]);
      setNotifications(notifRes.data);
      setUnread(countRes.data.count);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      const endpoint = isAdmin ? '/notifications/admin/read-all' : '/notifications/read-all';
      await api.put(endpoint);
      setUnread(0);
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch {}
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications(n => n.map(x => x.id === notif.id ? { ...x, isRead: true } : x));
        setUnread(u => Math.max(0, u - 1));
      } catch {}
    }
    if (notif.bookingId) {
      navigate(isAdmin ? '/admin/bookings' : '/my-bookings');
      setOpen(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        style={{
          position: 'relative',
          background: isAdmin ? '#f8f9fa' : 'rgba(255,255,255,0.08)',
          border: isAdmin ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px', width: '38px', height: '38px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isAdmin ? '#718096' : 'rgba(255,255,255,0.8)', transition: 'all 0.2s',
        }}
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#e63946', color: '#fff', borderRadius: '50%',
            width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0d1117',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          background: '#fff', borderRadius: '16px', width: '340px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
          zIndex: 500, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, color: '#0d1117', fontSize: '0.95rem', margin: 0 }}>
              Notifications {unread > 0 && <span style={{ background: '#e63946', color: '#fff', borderRadius: '100px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', marginLeft: '0.4rem' }}>{unread}</span>}
            </h3>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#e63946', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#718096' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ fontSize: '0.875rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => handleClick(n)}
                  style={{
                    padding: '0.9rem 1.25rem', borderBottom: '1px solid #f8f9fa',
                    cursor: n.bookingId ? 'pointer' : 'default',
                    background: n.isRead ? '#fff' : 'rgba(230,57,70,0.03)',
                    transition: 'background 0.15s',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => { if (n.bookingId) e.currentTarget.style.background = '#f8f9fa'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? '#fff' : 'rgba(230,57,70,0.03)'; }}
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50', flexShrink: 0, marginTop: '6px',
                    background: n.isRead ? 'transparent' : TYPE_COLORS[n.type] || '#3b82f6',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: n.isRead ? 500 : 700, color: '#0d1117', fontSize: '0.875rem', margin: '0 0 0.2rem', lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ color: '#718096', fontSize: '0.8rem', margin: '0 0 0.3rem', lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ color: '#a0aec0', fontSize: '0.72rem', margin: 0 }}>{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
