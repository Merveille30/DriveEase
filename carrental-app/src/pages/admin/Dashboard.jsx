import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const STAT_CONFIG = [
  { key: 'users', label: 'Registered Users', link: '/admin/users', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'vehicles', label: 'Listed Vehicles', link: '/admin/vehicles', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/><circle cx="16" cy="17" r="2"/><circle cx="9" cy="17" r="2"/></svg> },
  { key: 'bookings', label: 'Total Bookings', link: '/admin/bookings', color: '#e63946', bg: 'rgba(230,57,70,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { key: 'brands', label: 'Car Brands', link: '/admin/brands', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
  { key: 'subscribers', label: 'Subscribers', link: '/admin/subscribers', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { key: 'queries', label: 'Contact Queries', link: '/admin/queries', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { key: 'testimonials', label: 'Testimonials', link: '/admin/testimonials', color: '#f4a261', bg: 'rgba(244,162,97,0.1)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
];

const QUICK_ACTIONS = [
  { label: 'Add Vehicle', link: '/admin/vehicles', desc: 'List a new car in the fleet' },
  { label: 'Add Brand', link: '/admin/brands', desc: 'Create a new car brand' },
  { label: 'View Bookings', link: '/admin/bookings', desc: 'Manage all reservations' },
  { label: 'View Queries', link: '/admin/queries', desc: 'Respond to customer messages' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}); }, []);

  if (!stats) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d1117', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ color: '#718096', fontSize: '0.9rem' }}>Welcome to your DriveEase admin panel</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {STAT_CONFIG.map(s => (
          <Link to={s.link} key={s.key} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '0.75rem' }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d1117', letterSpacing: '-0.03em', lineHeight: 1 }}>{stats[s.key] ?? 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.3rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1117', marginBottom: '1.25rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {QUICK_ACTIONS.map(a => (
            <Link to={a.link} key={a.label} style={{ textDecoration: 'none', display: 'block', padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.05)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <div style={{ fontWeight: 600, color: '#0d1117', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{a.label}</div>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
