import './Home.css';
import logo from '../assets/logo.png';
import homepageBg from '../assets/homepage-bg.png';

export default function Home({ onEnter }) {
  return (
    <div className="home">

      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-left">
          <button className="nav-link nav-link--active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Home
          </button>
          <button className="nav-link">About the App</button>
          <button className="nav-link">The Team</button>
          <button className="nav-link">What is LTO</button>
        </div>

        <div className="home-nav-center">
          <img src={logo} alt="LTO Logo" className="nav-logo" />
          <div className="nav-brand">
            <span className="nav-brand-name">LTO MANAGEMENT</span>
            <span className="nav-brand-sub">LAND TRANSPORTATION OFFICE</span>
          </div>
        </div>

        <div className="home-nav-right">
          <button className="nav-btn-outline">Documentation</button>
          <button className="nav-btn-filled" onClick={onEnter}>Admin Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        {/* Background image */}
        <img src={homepageBg} alt="" className="hero-bg-image" />

        {/* Hero content */}
        <div className="hero-content">
          <span className="hero-eyebrow">Land Transportation Office</span>
          <h1 className="hero-headline">
            <span className="hero-headline-black">DRIVER RECORDS</span>
            <span className="hero-headline-orange">MADE SIMPLE.</span>
          </h1>
          <p className="hero-sub">
            Manage driver information, licenses, violations,<br />
            and history with speed and accuracy.
          </p>
          <button className="hero-cta" onClick={onEnter}>
            <span className="hero-cta-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 1C8.676 1 6 3.676 6 7c0 2.09 1.02 3.938 2.588 5.088C5.418 13.348 3 16.433 3 20h2c0-3.309 2.691-6 6-6s6 2.691 6 6h2c0-3.567-2.418-6.652-5.588-7.912C14.98 10.938 16 9.09 16 7c0-3.324-2.676-6-4-6zm0 2c1.105 0 4 1.791 4 4s-2.895 4-4 4-4-1.791-4-4 2.895-4 4-4z"/>
              </svg>
            </span>
            <span className="hero-cta-text">
              <span className="hero-cta-title">DIRECT TO ADMIN</span>
              <span className="hero-cta-sub">LTO System</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </section>

    </div>
  );
}