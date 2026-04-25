import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/admin/testimonials').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async (id, status) => {
    await api.put(`/admin/testimonials/${id}/status`, { status: status === 1 ? 0 : 1 });
    toast.success('Status updated'); load();
  };

  return (
    <>
      <h1>Testimonials</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>User</th><th>Testimonial</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {items.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td>{t.tblusers?.FullName || t.UserEmail}</td>
                <td style={{ maxWidth: '300px' }}>{t.Testimonial?.slice(0, 100)}...</td>
                <td>{new Date(t.PostingDate).toLocaleDateString()}</td>
                <td><span className={t.status === 1 ? 'status-confirmed' : 'status-pending'}>{t.status === 1 ? 'Active' : 'Pending'}</span></td>
                <td>
                  <button className={`btn btn-sm ${t.status === 1 ? 'btn-danger' : 'btn-success'}`} onClick={() => toggle(t.id, t.status)}>
                    {t.status === 1 ? 'Deactivate' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
