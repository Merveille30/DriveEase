import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import CarCard from '../components/CarCard';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

export default function CarListing() {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const fuel = searchParams.get('fuel') || '';

  useEffect(() => { api.get('/brands').then(r => setBrands(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (brand) params.set('brand', brand);
    if (fuel) params.set('fuel', fuel);
    api.get(`/vehicles?${params}`).then(r => {
      let data = r.data;
      if (priceMin) data = data.filter(c => Number(c.PricePerDay) >= Number(priceMin));
      if (priceMax) data = data.filter(c => Number(c.PricePerDay) <= Number(priceMax));
      setCars(data); setLoading(false);
    }).catch(() => setLoading(false));
  }, [search, brand, fuel, priceMin, priceMax]);

  const update = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const clearAll = () => { setSearchParams({}); setPriceMin(''); setPriceMax(''); };
  const hasFilters = search || brand || fuel || priceMin || priceMax;

  return (
    <>
      <div className="page-header">
        <h1>Browse Our Fleet</h1>
        <p>Find the perfect car for your journey</p>
      </div>
      <div className="listing-layout">
        <aside className="filter-sidebar">
          <h3>🔍 Filters</h3>
          <div className="filter-group">
            <label>Search</label>
            <input type="text" placeholder="Car name, model..." value={search} onChange={e => update('search', e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Brand</label>
            <select value={brand} onChange={e => update('brand', e.target.value)}>
              <option value="">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.BrandName}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Fuel Type</label>
            <select value={fuel} onChange={e => update('fuel', e.target.value)}>
              <option value="">All Types</option>
              <option value="Petrol">⛽ Petrol</option>
              <option value="Diesel">🛢 Diesel</option>
              <option value="CNG">🌿 CNG</option>
              <option value="Electric">⚡ Electric</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Price Range ($/day)</label>
            <div className="price-range-row">
              <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} min="0" />
              <span>–</span>
              <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} min="0" />
            </div>
          </div>
          {hasFilters && (
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={clearAll}>✕ Clear Filters</button>
          )}
        </aside>
        <div>
          {!loading && (
            <p className="result-count">Showing <strong>{cars.length}</strong> vehicle{cars.length !== 1 ? 's' : ''}{hasFilters ? ' matching your filters' : ''}</p>
          )}
          {loading ? (
            <div className="cars-grid" style={{ margin: 0 }}>{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--dark)', marginBottom: '0.5rem' }}>No cars found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try adjusting your filters or search terms.</p>
              <button className="btn btn-primary" onClick={clearAll}>Clear Filters</button>
            </div>
          ) : (
            <div className="cars-grid" style={{ margin: 0 }}>{cars.map(car => <CarCard key={car.id} car={car} />)}</div>
          )}
        </div>
      </div>
    </>
  );
}
