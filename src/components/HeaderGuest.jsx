import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

// dentro de HeaderGuest
const onToggle = (e) => {
  const parent = e.currentTarget.closest('.dropdown');
  const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
  // Cerrar otros abiertos
  document.querySelectorAll('.nav-desktop .dropdown.open').forEach(d => {
    if (d !== parent) d.classList.remove('open');
    const btn = d.querySelector('.dropdown-toggle[aria-expanded="true"]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
  // Toggle actual
  parent.classList.toggle('open', !expanded);
  e.currentTarget.setAttribute('aria-expanded', String(!expanded));
};


const HeaderGuest = () => (
  <header className="header">
    <div className="layout-container header__inner">
      <div className="logo-area">
        <Link to="/" className="site-title">AEC<span className="highlight">Block</span></Link>
      </div>
      <nav className="nav-desktop">
        {/* Dropdown Iniciar Sesión */}
        <div className="nav-item dropdown">
          <button className="nav__link dropdown-toggle" type="button"
            aria-haspopup="true" aria-expanded="false" onClick={onToggle}>
            Iniciar Sesión
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link to="/login" className="dropdown-item">Acceso Cliente</Link>
            </li>
            <li>
              <Link to="/login-colaborador" className="dropdown-item">Acceso Creador</Link>
            </li>
          </ul>
        </div>
        {/* Dropdown Registrarse */}
        <div className="nav-item dropdown">
          <button className="nav__button dropdown-toggle" type="button"
            aria-haspopup="true" aria-expanded="false" onClick={onToggle}>
            Registrarse
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link to="/registro" className="dropdown-item">Como Cliente</Link>
            </li>
            <li>
              <Link to="/solicitudCreador" className="dropdown-item">Como Creador</Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
);

export default HeaderGuest;
