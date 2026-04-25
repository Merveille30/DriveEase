import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/contact/info').then(r => setInfo(r.data)); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact/query', form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header"><h1>Contact Us</h1></div>
      <div className="contact-layout">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          {info && (
            <>
              <div className="contact-info-item">
                <span className="icon">📍</span>
                <div><strong>Address</strong><p>{info.Address}</p></div>
              </div>
              <div className="contact-info-item">
                <span className="icon">📧</span>
                <div><strong>Email</strong><p>{info.EmailId}</p></div>
              </div>
              <div className="contact-info-item">
                <span className="icon">📞</span>
                <div><strong>Phone</strong><p>{info.ContactNo}</p></div>
              </div>
            </>
          )}
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#1a1a2e' }}>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'text' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label>{f.label}</label>
                <input type={f.type} required value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label>Message</label>
              <textarea rows={4} required value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
