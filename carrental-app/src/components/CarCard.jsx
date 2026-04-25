import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/currency';

export default function CarCard({ car }) {
  const imgSrc = car.Vimage1
    ? (car.Vimage1.startsWith('http') ? car.Vimage1 : `/api/uploads/${car.Vimage1}`)
    : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80';

  return (
    <div className="car-card">
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt={car.VehiclesTitle}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80'; }}
        />
        {car.tblbrands?.BrandName && <span className="car-badge-brand">{car.tblbrands.BrandName}</span>}
        {car.PricePerDay && <span className="car-badge-price">{formatCurrency(car.PricePerDay)}/day</span>}
      </div>
      <div className="car-card-body">
        <h3>{car.VehiclesTitle}</h3>
        <div className="car-meta">
          {car.FuelType && <span>⛽ {car.FuelType}</span>}
          {car.ModelYear && <span>📅 {car.ModelYear}</span>}
          {car.SeatingCapacity && <span>👥 {car.SeatingCapacity} seats</span>}
        </div>
      </div>
      <div className="car-card-footer">
        <Link to={`/cars/${car.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
}
