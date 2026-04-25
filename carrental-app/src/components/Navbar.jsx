import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setDropdownOpen(false); setMobileOpen(false); navigate('/'); };
  const initials = user ? (user.name || user.email || 'U').charAt(0).toUpperCase() : '';

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="navbar-brand">Drive<span>Ease</span></Link>

        <div className="navbar-links" style={{ display: 'flex' }}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/cars">Cars</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user ? (
            <>
              {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
              {user.role !== 'admin' && <NavLink to="/my-bookings">My Bookings</NavLink>}
              {user.role !== 'admin' && <NotificationBell isAdmin={false} />}
              <div className="navbar-dropdown" ref={dropdownRef}>
                <div className="navbar-avatar" onClick={() => setDropdownOpen(o => !o)} title={user.name || user.email}>{initials}</div>
                {dropdownOpen && (
                  <div className="navbar-dropdown-menu">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>👤 Profile</Link>
                    {user.role !== 'admin' && <Link to="/my-bookings" onClick={() => setDropdownOpen(false)}>📋 My Bookings</Link>}
                    <button onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-outline-white btn-sm" onClick={() => setShowLogin(true)}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowRegister(true)}>Register</button>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`navbar-mobile${mobileOpen ? ' open' : ''}`}>
        <NavLink to="/" end onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/cars" onClick={() => setMobileOpen(false)}>Cars</NavLink>
        <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
        {user ? (
          <>
            <NavLink to="/profile" onClick={() => setMobileOpen(false)}>Profile</NavLink>
            {user.role !== 'admin' && <NavLink to="/my-bookings" onClick={() => setMobileOpen(false)}>My Bookings</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin" onClick={() => setMobileOpen(false)}>Admin</NavLink>}
            <button className="btn btn-secondary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowLogin(true); setMobileOpen(false); }}>Login</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setShowRegister(true); setMobileOpen(false); }}>Register</button>
          </div>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
    </>
  );
}
