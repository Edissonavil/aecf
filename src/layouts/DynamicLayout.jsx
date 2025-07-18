// src/layouts/DynamicLayout.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import HeaderGuest from '../components/HeaderGuest';
import HeaderClient from '../components/HeaderClient';
import HeaderStaff from '../components/HeaderStaff';
import HeaderAdmin from '../components/HeaderAdmin';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

export default function DynamicLayout() {
  const { isAuthenticated, role, isAuthLoading } = useAuth();
  const safeRole = (role || '').toUpperCase();

  if (isAuthLoading) return null; // o spinner

  let Header = HeaderGuest;
  let layout = 'vertical';

  if (isAuthenticated) {
    if (safeRole === 'ROL_CLIENTE') Header = HeaderClient;
    else if (safeRole === 'ROL_COLABORADOR') {
      Header = HeaderStaff;
      layout = 'lateral';
    } else if (safeRole === 'ROL_ADMIN') {
      Header = HeaderAdmin;
      layout = 'lateral';
    }
  }

  if (layout === 'lateral') {
    return (
      <div style={{ display: 'flex' }}>
        <Header />
        <main style={{ flex: 1, padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    );
  }

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
