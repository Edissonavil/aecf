import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HeaderClient = () => {
  const navigate = useNavigate();
  const { username, cartItemCount, logout } = useContext(AuthContext);

  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Define your color palette
  const primaryPink = '#FF00FF'; // Vibrant pink
  const lightPink = '#FFC0CB'; // Lighter pink for accents/hover
   const darkerPink = '#C71585'; 
  const textDark = '#333'; // Darker text for contrast
  const textMuted = '#666'; // Muted text for descriptions
  const borderColor = '#f7efefff'; // Subtle border

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
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        backgroundColor: scrolled ? '#ffffff' : 'transparent', // White or transparent
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', // Soft shadow on scroll
        padding: '10px 0', // Add some vertical padding
      }}
    >
      <nav 
        className="navbar navbar-expand-lg" 
        style={{
          padding: '0', // Remove default navbar padding
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Branding */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span 
              style={{ 
                fontSize: '1.5rem', // Larger, more impactful title
                fontWeight: '600', 
                color: textDark, 
                letterSpacing: '-0.5px' 
              }}
            >
              AEC<span style={{ color: primaryPink, fontWeight: '700' }}>Block</span>
            </span>
          </Link>

          {/* Navigation and User Menu */}
          <ul 
            style={{ 
              listStyle: 'none', 
              margin: 0, 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px' // Space between nav items
            }}
          >
            {/* Welcome message for larger screens */}
            <li className="d-none d-lg-block">
              <span 
                style={{ 
                  color: textMuted, 
                  fontSize: '0.9rem', 
                  fontWeight: '500' 
                }}
              >
                Bienvenid@ <span style={{ color: textDark, fontWeight: '600' }}>{username}</span>
              </span>
            </li>

            {/* Cart Icon */}
            <li style={{ position: 'relative' }}>
              <Link to="/cart" style={{ textDecoration: 'none', color: textDark, fontSize: '1.5rem' }}>
                🛒
                {cartItemCount > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-8px', // Adjust position
                      right: '-8px', // Adjust position
                      backgroundColor: primaryPink, // Pink badge
                      color: '#ffffff',
                      borderRadius: '50%', // Circular badge
                      padding: '2px 7px', // Smaller padding
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      minWidth: '22px', // Ensure it's a circle
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(255,105,180,0.4)', // Soft shadow for badge
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </li>

            {/* User Dropdown */}
            <li style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                style={{
                  background: 'none',
                  border: `1px solid ${borderColor}`, // Subtle border
                  borderRadius: '25px', // Pill shape for the button
                  padding: '8px 18px', // More padding
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: textDark,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  // Hover effects
                  '&:hover': {
                    backgroundColor: lightPink,
                    borderColor: primaryPink,
                    color: darkerPink,
                  }
                }}
                onClick={() => setShowUserMenu(u => !u)}
              >
                Mi Cuenta <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>▼</span> {/* Custom arrow */}
              </button>
              
              <ul 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)', // Dropdown below button
                  right: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.12)', // Stronger shadow for dropdown
                  listStyle: 'none',
                  margin: 0,
                  padding: '8px 0',
                  minWidth: '160px',
                  display: showUserMenu ? 'block' : 'none',
                  opacity: showUserMenu ? 1 : 0,
                  transform: showUserMenu ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
              >
                <li>
                  <Link 
                    to="/perfil" 
                    style={{ 
                      display: 'block', 
                      padding: '10px 15px', 
                      textDecoration: 'none', 
                      color: textDark, 
                      fontSize: '0.9rem',
                      // Hover effect
                      '&:hover': {
                        backgroundColor: lightPink,
                        color: darkerPink,
                      }
                    }}
                  >
                    Cuenta
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/store" 
                    style={{ 
                      display: 'block', 
                      padding: '10px 15px', 
                      textDecoration: 'none', 
                      color: textDark, 
                      fontSize: '0.9rem',
                      // Hover effect
                      '&:hover': {
                        backgroundColor: lightPink,
                        color: darkerPink,
                      }
                    }}
                  >
                    Compras
                  </Link>
                </li>
                <li>
                  <hr style={{ margin: '8px 0', border: 'none', borderBottom: `1px solid ${borderColor}` }}/>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      background: 'none', 
                      border: 'none', 
                      padding: '10px 15px', 
                      color: primaryPink, // Red for logout
                      fontSize: '0.9rem', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      // Hover effect
                      '&:hover': {
                        backgroundColor: lightPink,
                        color: primaryPink, // Keep text red on hover
                      }
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default HeaderClient;