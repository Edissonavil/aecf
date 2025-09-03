import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Layout.css';

const HeaderClient = () => {
  const navigate = useNavigate();
  const { username, cartItemCount, logout, refreshCartCount } = useContext(AuthContext);

  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 👇 Asegura que el contador se cargue al montar el header
  useEffect(() => {
    refreshCartCount?.();
  }, [refreshCartCount]);

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

  const badgeText = cartItemCount > 99 ? '99+' : String(cartItemCount || 0);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="layout-container header__inner">
        {/* Branding */}
        <div className="logo-area">
          <Link to="/" className="site-title">
            AEC<span className="highlight">Block</span>
          </Link>
        </div>

        {/* Nav + usuario */}
        <nav className="nav-desktop">
          <span className="d-none d-lg-block nav__link">
            Bienvenid@ <strong style={{ color: '#333' }}>{username}</strong>
          </span>

          {/* Carrito */}
          <Link
            to="/cart"
            className="nav__cart"
            aria-label={`Ir al carrito (${cartItemCount} producto${cartItemCount === 1 ? '' : 's'})`}
          >
            <span className="nav__cart-icon" aria-hidden="true">🛒</span>
            {Number(cartItemCount) > 0 && (
              <span className="nav__badge" aria-live="polite">{badgeText}</span>
            )}
          </Link>

          {/* Menú usuario */}
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
              <li><hr className="user-dropdown-divider" /></li>
              <li>
                <button onClick={handleLogout} className="user-dropdown-logout-btn">
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
