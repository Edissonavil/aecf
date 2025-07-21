import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Layout.css'; // Asegúrate de importar el CSS unificado

const HeaderClient = () => {
  const navigate = useNavigate();
  const { username, cartItemCount, logout } = useContext(AuthContext);

  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = e => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Usa las clases 'header' y 'header--scrolled' del CSS
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="layout-container header__inner">
        {/* Branding - Ahora usando clases de CSS */}
        <div className="logo-area">
          <Link to="/" className="site-title">
            AEC<span className="highlight">Block</span>
          </Link>
        </div>

        {/* Navigation and User Menu */}
        <nav className="nav-desktop"> {/* Usa la clase nav-desktop */}
          {/* Welcome message for larger screens */}
          <span className="d-none d-lg-block nav__link"> {/* Puedes usar nav__link para el estilo de texto */}
            Bienvenid@ <strong style={{ color: '#333' }}>{username}</strong>
          </span>

          {/* Cart Icon */}
          <Link to="/cart" className="nav__cart">
            🛒
            {cartItemCount > 0 && (
              <span className="nav__badge">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <div className="nav__dropdown" ref={userMenuRef}>
            <button
              className="user-dropdown-toggle"
              onClick={() => setShowUserMenu(u => !u)}
            >
              Mi Cuenta <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>▼</span>
            </button>

            <ul className={`user-dropdown-menu ${showUserMenu ? 'show' : ''}`}>
              <li>
                <Link to="/perfil" className="user-dropdown-item">
                  Cuenta
                </Link>
              </li>
              <li>
                <hr className="user-dropdown-divider" />
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="user-dropdown-logout-btn"
                >
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default HeaderClient;