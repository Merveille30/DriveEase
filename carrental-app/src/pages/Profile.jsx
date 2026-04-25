import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/profile').then(r => setProfile(r.data));
  }, []);

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        fullname: profile.FullName, mobile: profile.ContactNo,
        dob: profile.dob, address: profile.Address, city: profile.City, country: profile.Country
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header"><h1>My Profile</h1></div>
      <div className="profile-layout">
        <div className="profile-sidebar">
          <h3>{profile.FullName}</h3>
          <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '1rem' }}>{profile.EmailId}</p>
          <nav>
            <NavLink to="/profile" end>Edit Profile</NavLink>
            <NavLink to="/my-bookings">My Bookings</NavLink>
            <NavLink to="/profile/change-password">Change Password</NavLink>
          </nav>
        </div>
        <div className="profile-main">
          <h2 style={{ marginBottom: '1.5rem', color: '#1a1a2e' }}>Edit Profile</h2>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Full Name', key: 'FullName', type: 'text' },
                { label: 'Email', key: 'EmailId', type: 'email', disabled: true },
                { label: 'Mobile', key: 'ContactNo', type: 'text' },
                { label: 'Date of Birth', key: 'dob', type: 'date' },
                { label: 'City', key: 'City', type: 'text' },
                { label: 'Country', key: 'Country', type: 'text' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input type={f.type} disabled={f.disabled} value={profile[f.key] || ''}
                    onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Address</label>
              <input type="text" value={profile.Address || ''}
                onChange={e => setProfile({ ...profile, Address: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
