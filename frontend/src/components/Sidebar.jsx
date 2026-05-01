import './Sidebar.css';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
    {
        key: 'driver',
        label: 'Drivers',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        key: 'vehicle',
        label: 'Vehicles',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
    },
    {
        key: 'registration',
        label: 'Registration',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    },
    {
        key: 'violation',
        label: 'Violations',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
];

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

/* SVG Shape */
function CurvedPanel() {
    return (
        <div className="sidebar-curve">
            <svg width="72" height="75%" viewBox="0 0 96 838" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.000976562 0C0.000976562 0 -0.38117 43.7131 17.8096 58.1064C36.0005 72.4996 38.4142 71.5635 65.3584 80.7383C92.0593 89.8305 95.9323 125.351 96 125.991V716.008C95.936 716.614 92.0727 752.165 65.3584 761.262C38.4144 770.436 36.0014 769.5 17.8105 783.894C2.97386 795.633 0.491815 826.876 0.0810547 837.999C0.0540387 837.999 0.0270212 838 0 838V0H0.000976562Z" fill="url(#paint0_linear_53_35)" />
                <defs>
                    <linearGradient id="paint0_linear_53_35" x1="48" y1="0" x2="48" y2="838" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CA3B2F" />
                        <stop offset="1" stop-color="#E15A38" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

export default function Sidebar({ active, onNavigate, onLogout }) {
    return (
        <aside className="sidebar">

            <div className="sidebar-labels">
                <div className="label-brand">
                    <img src={logo} alt="LTO Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <span className="label-brand-name">LTO System</span>
                    <span className="label-brand-sub">Land Transportation Office</span>
                </div>

                <div className="label-nav">
                    <CurvedPanel />
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            className={`label-item${active === item.key ? ' label-item--active' : ''}`}
                            onClick={() => onNavigate(item.key)}
                        >
                            <span className="label-item-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="label-logout">
                    <button className="label-logout-btn" onClick={onLogout}>
                        <LogoutIcon />
                        Logout
                    </button>
                </div>
            </div>

        </aside>
    );
}