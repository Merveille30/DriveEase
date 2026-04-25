import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminSubscribers() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/admin/subscribers').then(r => setItems(r.data)); }, []);

  return (
    <>
      <h1>Newsletter Subscribers</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Email</th><th>Subscribed On</th></tr></thead>
          <tbody>
            {items.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td><td>{s.SubscriberEmail}</td>
                <td>{new Date(s.PostingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
