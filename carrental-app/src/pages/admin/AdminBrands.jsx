import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/admin/brands').then(r => setBrands(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/brands/${editing}`, { name }); toast.success('Brand updated'); }
      else { await api.post('/admin/brands', { name }); toast.success('Brand created'); }
      setName(''); setEditing(null); load();
    } catch { toast.error('Save failed'); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this brand?')) return;
    await api.delete(`/admin/brands/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <>
      <h1>Brands</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit' : 'Add'} Brand</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Brand Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">Save</button>
              {editing && <button className="btn btn-secondary" type="button" onClick={() => { setEditing(null); setName(''); }}>Cancel</button>}
            </div>
          </form>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Brand Name</th><th>Actions</th></tr></thead>
            <tbody>
              {brands.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td><td>{b.BrandName}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => { setEditing(b.id); setName(b.BrandName); }} style={{ marginRight: '0.5rem' }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
