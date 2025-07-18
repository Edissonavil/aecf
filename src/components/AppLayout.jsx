// src/components/AppLayout.jsx
import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderGuest from './HeaderGuest';
import HeaderClient from './HeaderClient';
import HeaderStaff from './HeaderStaff';
import HeaderAdmin from './HeaderAdmin';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';

export default function AppLayout() {
  const { isAuthenticated, role } = useContext(AuthContext);
  const safeRole = (role || '').toUpperCase();

  // Elige el header según el rol
  const Header = () => {
    if (isAuthenticated && safeRole === 'ROL_CLIENTE') return <HeaderClient />;
    if (isAuthenticated && safeRole === 'ROL_COLABORADOR') return <HeaderStaff />;
    if (isAuthenticated && safeRole === 'ROL_ADMIN') return <HeaderAdmin />;
    return <HeaderGuest />;
  };

  return (
    <>
      <Header />
      <main style={{ marginTop: '72px' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
