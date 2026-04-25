import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

export default function CmsPage() {
  const { type } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get(`/pages/${type}`).then(r => setPage(r.data)).catch(() => setPage(null));
  }, [type]);

  if (!page) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header"><h1>{page.PageName}</h1></div>
      <section className="section">
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div dangerouslySetInnerHTML={{ __html: page.detail }} style={{ lineHeight: 1.8, color: '#444' }} />
        </div>
      </section>
    </>
  );
}
