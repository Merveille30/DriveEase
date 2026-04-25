import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/admin/users').then(r => setUsers(r.data)); }, []);

  return (
    <>
      <h1>Registered Users</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Country</th><th>Joined</th></tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td><td>{u.FullName}</td><td>{u.EmailId}</td>
                <td>{u.ContactNo}</td><td>{u.City}</td><td>{u.Country}</td>
                <td>{new Date(u.RegDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
