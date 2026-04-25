import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import CarCard from '../components/CarCard';

const TESTIMONIALS = [
  { id: 1, text: "Absolutely seamless experience from booking to return. The car was immaculate and pricing was transparent with no hidden fees. Will definitely use DriveEase again!", name: "Sarah Mitchell", role: "Business Traveler", initials: "SM" },
  { id: 2, text: "I rented an SUV for a family road trip and it was perfect. Online booking took less than 5 minutes and the car was ready exactly when promised.", name: "James Okafor", role: "Family Vacationer", initials: "JO" },
  { id: 3, text: "Best car rental service I've used. The luxury fleet is impressive and customer support was incredibly helpful when I needed to extend my rental.", name: "Priya Sharma", role: "Frequent Renter", initials: "PS" },
];

const WHY_ITEMS = [
  { icon: '🚗', title: 'Wide Selection', desc: 'From compact city cars to premium SUVs and luxury sedans — the perfect vehicle for every occasion.' },
  { icon: '💰', title: 'Best Prices', desc: 'Transparent, competitive daily rates with no hidden fees. Price match guarantee on all bookings.' },
  { icon: '🔒', title: 'Fully Insured', desc: 'Every vehicle in our fleet is comprehensively insured. Drive with complete peace of mind.' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Book your car in under 2 minutes. Instant confirmation with 24/7 customer support.' },
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchBrand, setSearchBrand] = useState('');
  const [searchFuel, setSearchFuel] = useState('');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/vehicles').then(r => setCars(r.data.slice(0, 9))).catch(() => {});
    api.get('/brands').then(r => setBrands(r.data)).catch(() => {});
    const img = new Image();
    img.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90';
    img.onload = () => setBgLoaded(true);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchBrand) params.set('brand', searchBrand);
    if (searchFuel) params.set('fuel', searchFuel);
    navigate(`/cars?${params.toString()}`);
  };

  const handleNewsletter = e => {
    e.preventDefault();
    if (newsletterEmail) {
      api.post('/contact/subscribe', { email: newsletterEmail }).catch(() => {});
      setNewsletterEmail('');
      alert('Thanks for subscribing!');
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className={`hero-bg${bgLoaded ? ' loaded' : ''}`}
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90')` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-eyebrow">✦ Premium Car Rental Service</div>
          <h1>Drive Your<br /><span className="gradient-text">Dream Car</span></h1>
          <p>Discover our curated fleet of premium vehicles. From sleek sedans to powerful SUVs — your perfect ride is just a click away.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <select value={searchBrand} onChange={e => setSearchBrand(e.target.value)}>
              <option value="">🏷 All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.BrandName}</option>)}
            </select>
            <select value={searchFuel} onChange={e => setSearchFuel(e.target.value)}>
              <option value="">⛽ All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
            </select>
            <button type="submit" className="btn btn-primary btn-lg">Search Cars →</button>
          </form>
        </div>
        <div className="hero-scroll-hint"><span>↓</span><span>Scroll</span></div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item"><h2>500+</h2><p>Cars Available</p></div>
          <div className="stat-item"><h2>50+</h2><p>Premium Brands</p></div>
          <div className="stat-item"><h2>10k+</h2><p>Happy Customers</p></div>
          <div className="stat-item"><h2>24/7</h2><p>Customer Support</p></div>
        </div>
      </section>

      {/* FEATURED CARS */}
      <section className="section gray-bg">
        <div className="section-header">
          <span className="eyebrow">Our Fleet</span>
          <h2>Featured <span>Vehicles</span></h2>
          <p>Explore our most popular rental cars — handpicked for quality, comfort, and value.</p>
        </div>
        {cars.length > 0 ? (
          <div className="cars-grid">{cars.map(car => <CarCard key={car.id} car={car} />)}</div>
        ) : (
          <div className="cars-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line medium" />
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="/cars" className="btn btn-primary btn-lg">View All Cars →</a>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section">
        <div className="section-header">
          <span className="eyebrow">Why DriveEase</span>
          <h2>The Smarter Way to <span>Rent</span></h2>
          <p>We've reimagined car rental from the ground up — making it faster, fairer, and more enjoyable.</p>
        </div>
        <div className="why-grid">
          {WHY_ITEMS.map(item => (
            <div key={item.title} className="why-card">
              <div className="why-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section gray-bg">
        <div className="section-header">
          <span className="eyebrow">Customer Stories</span>
          <h2>What Our <span>Customers</span> Say</h2>
          <p>Don't just take our word for it — hear from thousands of satisfied renters.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.id} className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p>"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div><h5>{t.name}</h5><small>{t.role}</small></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter-section">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2>Get Exclusive Deals</h2>
          <p>Subscribe and be the first to know about special offers and new arrivals.</p>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input type="email" placeholder="Enter your email address" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
