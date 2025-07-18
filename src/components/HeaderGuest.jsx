import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

const HeaderGuest = () => (
  <header className="header">
    <div className="layout-container header__inner">
      <div className="logo-area">
        <Link to="/" className="site-title">AEC<span className="highlight">Block</span></Link>
      </div>
      <nav className="nav-desktop">
        <Link to="/login" className="nav__link">Iniciar Sesión</Link>
        <Link to="/registro" className="nav__button">Registrarse</Link>
      </nav>
    </div>
  </header>
);

export default HeaderGuest;