import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminQueries() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/admin/queries').then(r => setItems(r.data)); }, []);

  return (
    <>
      <h1>Contact Queries</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th></tr></thead>
          <tbody>
            {items.map((q, i) => (
              <tr key={q.id}>
                <td>{i + 1}</td><td>{q.name}</td><td>{q.EmailId}</td><td>{q.ContactNumber}</td>
                <td style={{ maxWidth: '250px' }}>{q.Message?.slice(0, 80)}...</td>
                <td>{new Date(q.PostingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
