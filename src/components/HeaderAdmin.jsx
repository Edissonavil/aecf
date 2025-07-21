import React, { useContext } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login-colaborador');
  };

  const menuItems = [
    { 
      path: '/admin/stats/admin', 
      icon: '📊', 
      label: 'Dashboard General',
      description: 'Vista general del sistema'
    },
    { 
      path: '/admin/revisar-productos', 
      icon: '📦', 
      label: 'Gestionar Productos',
      description: 'Revisar y moderar productos'
    },
    { 
      path: '/admin/revisarPagos', 
      icon: '💳', 
      label: 'Revisar Comprobantes',
      description: 'Validar pagos y transacciones'
    },
    { 
      path: '/admin/gestionarUsuarios', 
      icon: '👥', 
      label: 'Gestionar Usuarios',
      description: 'Administrar cuentas de usuario'
    },
    { 
      path: '/admin/crearUsuario', 
      icon: '➕', 
      label: 'Crear Usuario',
      description: 'Añadir nuevos usuarios'
    },
    { 
      path: '/admin/perfil', 
      icon: '⚙️', 
      label: 'Mi Cuenta',
      description: 'Configuración personal'
    }
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const primaryColor = '#FF00FF'; // Rosa vibrante
  const lightPink = '#FFC0CB'; // Rosa claro para hover
  const darkerPink = '#C71585'; // Rosa más oscuro para texto

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar fijo */}
      <div 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '260px', // Ancho fijo del sidebar
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRight: `1px solid #e0e0e0`,
          padding: '20px 0',
          position: 'fixed', // Hace que el sidebar sea fijo en la pantalla
          height: '100vh',   // Ocupa el 100% del alto del viewport
          overflowY: 'auto', // Permite el scroll interno si el contenido del sidebar es largo
          zIndex: 1000,      // Asegura que el sidebar esté por encima de otros elementos
        }}
      >
        {/* Header del sidebar */}
        <div style={{ padding: '0 20px 20px', borderBottom: `1px solid #f0f0f0` }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.25rem', color: '#333' }}>
                AEC.<span style={{ color: primaryColor }}>ADMIN</span>
              </div>
              <small style={{ color: '#888', fontSize: '0.8rem' }}>Panel de Administración</small>
            </div>
          </div>
          
          {/* Saludo al usuario */}
          <div 
            style={{ 
              padding: '10px 15px',
              borderRadius: '8px',
              backgroundColor: '#fbfbfb',
              border: `1px solid #eee`
            }}
          >
            <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '3px' }}>Bienvenid@</div>
            <div style={{ fontWeight: 'bold', color: darkerPink, fontSize: '0.95rem' }}>{username}</div>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flexGrow: '1', padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  padding: '12px 15px',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActiveLink(item.path) ? primaryColor : 'transparent',
                  color: isActiveLink(item.path) ? '#ffffff' : '#444',
                  boxShadow: isActiveLink(item.path) ? '0 2px 6px rgba(255,105,180,0.3)' : 'none',
                  fontWeight: isActiveLink(item.path) ? 'bold' : 'normal',
                }}
                onMouseEnter={(e) => {
                  if (!isActiveLink(item.path)) {
                    e.currentTarget.style.backgroundColor = lightPink;
                    e.currentTarget.style.color = darkerPink;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveLink(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#444';
                  }
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '1rem' }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{ fontSize: '0.9rem' }}>{item.label}</div>
                  <small style={{ 
                    fontSize: '0.7rem', 
                    color: isActiveLink(item.path) ? 'rgba(255,255,255,0.7)' : '#888' 
                  }}>
                    {item.description}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Botón de logout */}
        <div style={{ padding: '20px', borderTop: `1px solid #f0f0f0` }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 15px',
              borderRadius: '6px',
              border: `1px solid ${primaryColor}`,
              backgroundColor: 'transparent',
              color: primaryColor,
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',

            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor;
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(255,105,180,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = primaryColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ marginRight: '8px' }}>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Área de contenido principal */}
      <div style={{ 
        flexGrow: '1', 
        marginLeft: '260px', // Ajustar este margen al ancho del sidebar
        padding: '25px', 
        overflowY: 'auto', 
        height: '100vh',
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default HeaderAdmin;
