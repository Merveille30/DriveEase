import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [form, setForm] = useState({ fullname: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Please login.');
      onSwitchToLogin();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', key: 'fullname', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Mobile', key: 'mobile', type: 'text' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input type={f.type} required value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="modal-footer">
          <p>Already have an account? <a onClick={onSwitchToLogin}>Login here</a></p>
        </div>
      </div>
    </div>
  );
}
