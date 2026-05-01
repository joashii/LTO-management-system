import './Banner.css';
import model1 from '../assets/model-1.png';
import model2 from '../assets/model-2.png';
import model3 from '../assets/model-3.png';
import model4 from '../assets/model-4.png';

const BANNER_CONTENT = {
  driver: {
    label: 'Driver Management',
    title: 'Driver Records',
    description: 'View and manage all registered drivers in the LTO system. Records include license information, personal details, license type, and current license status.',
    image: model1,
  },
  vehicle: {
    label: 'Vehicle Management',
    title: 'Vehicle Records',
    description: 'Browse and manage all registered motor vehicles. Includes plate number, engine and chassis details, vehicle type, make, model, and year of manufacture.',
    image: model2,
  },
  registration: {
    label: 'Registration Management',
    title: 'Vehicle Registrations',
    description: 'Track all vehicle registration records and renewals. Includes registration number, registration and expiration dates, and current registration status.',
    image: model3,
  },
  violation: {
    label: 'Violation Management',
    title: 'Traffic Violations',
    description: 'Record and monitor traffic violations committed by drivers. Includes violation type, date and location, fine amount, apprehending officer, and violation status.',
    image: model4,
  },
};

export default function Banner({ active }) {
  const content = BANNER_CONTENT[active];

  return (
    <div className="banner">
      {/* Left: text */}
      <div className="banner-content">
        <span className="banner-label">{content.label}</span>
        <h1 className="banner-title">{content.title}</h1>
        <p className="banner-description">{content.description}</p>
      </div>

      {/* Right: illustration or placeholder */}
      {content.image
        ? <img src={content.image} alt={content.title} className="banner-image" />
        : (
          <div className="banner-image-placeholder">
            <span>Illustration coming soon</span>
          </div>
        )
      }
    </div>
  );
}