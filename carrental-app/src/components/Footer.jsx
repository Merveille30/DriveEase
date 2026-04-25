import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const SocialIcons = {
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async e => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.post('/contact/subscribe', { email });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch {
      toast.error('Could not subscribe. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <div className="footer-logo">Drive<span>Ease</span></div>
          <p>Your premium car rental partner. We offer a curated fleet of vehicles for every journey — from city commutes to cross-country adventures.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">{SocialIcons.facebook}</a>
            <a href="#" aria-label="Twitter">{SocialIcons.twitter}</a>
            <a href="#" aria-label="Instagram">{SocialIcons.instagram}</a>
            <a href="#" aria-label="LinkedIn">{SocialIcons.linkedin}</a>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <div className="footer-col-links">
            <Link to="/">Home</Link>
            <Link to="/cars">Browse Cars</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/page/aboutus">About Us</Link>
            <Link to="/my-bookings">My Bookings</Link>
          </div>
        </div>
        <div>
          <h4>Our Services</h4>
          <div className="footer-col-links">
            <Link to="/cars">Car Rentals</Link>
            <Link to="/cars">Luxury Fleet</Link>
            <Link to="/cars">SUV Rentals</Link>
            <Link to="/page/faqs">FAQs</Link>
            <Link to="/page/terms">Terms & Conditions</Link>
          </div>
        </div>
        <div>
          <h4>Contact Us</h4>
          <p>📍 J&K Block, Laxmi Nagar, New Delhi</p>
          <p>📧 info@driveease.com</p>
          <p>📞 +1 897-456-1236</p>
          <p>🕐 Mon–Sat: 8am – 8pm</p>
        </div>
      </div>
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div>
            <h4>Stay in the loop</h4>
            <p>Get exclusive deals and new arrivals straight to your inbox.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '...' : 'Subscribe'}</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} DriveEase. All rights reserved. &nbsp;·&nbsp;
          <Link to="/page/privacy">Privacy Policy</Link> &nbsp;·&nbsp;
          <Link to="/page/terms">Terms</Link>
        </p>
      </div>
    </footer>
  );
}
