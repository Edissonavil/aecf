import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

const HeaderGuest = () => {
  const [open, setOpen] = useState({ login: false, register: false });
  const navRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!navRef.current || navRef.current.contains(e.target)) return;
      setOpen({ login: false, register: false });
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <header className="header">
      <div className="layout-container header__inner">
        <div className="logo-area">
          <Link to="/" className="site-title">AEC<span className="highlight">Block</span></Link>
        </div>

        <nav className="nav-desktop" ref={navRef}>
          {/* Dropdown Iniciar Sesión */}
          <div className="nav-item dropdown">
            <button
              className="nav__link dropdown-toggle"
              type="button"
              aria-haspopup="true"
              aria-expanded={open.login ? 'true' : 'false'}
              onClick={() => setOpen(s => ({ login: !s.login, register: false }))}
            >
              Iniciar Sesión
            </button>
            <ul className={`dropdown-menu ${open.login ? 'show' : ''}`}>
              <li>
                <Link to="/login" className="dropdown-item">Acceso Cliente</Link>
              </li>
              <li>
                <Link to="/login-colaborador" className="dropdown-item">Acceso Creador</Link>
              </li>
            </ul>
          </div>

          {/* Dropdown Registrarse */}
          <div className="nav-item dropdown align-right">
            <button
              className="nav__button dropdown-toggle"
              type="button"
              aria-haspopup="true"
              aria-expanded={open.register ? 'true' : 'false'}
              onClick={() => setOpen(s => ({ login: false, register: !s.register }))}
            >
              Registrarse
            </button>
            <ul className={`dropdown-menu ${open.register ? 'show' : ''}`}>
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
};

export default HeaderGuest;
