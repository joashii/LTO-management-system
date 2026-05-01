import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [page, setPage] = useState('home');

  if (page === 'dashboard') {
    return <Dashboard onLogout={() => setPage('home')} />;
  }

  return <Home onEnter={() => setPage('dashboard')} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);