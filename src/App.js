// src/App.js - Stats como páginas predeterminadas por rol
import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import HeaderGuest from './components/HeaderGuest';
import HeaderClient from './components/HeaderClient';
import HeaderStaff from './components/HeaderStaff';
import HeaderAdmin from './components/HeaderAdmin';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import LoginColab from './pages/LoginColab';
import UploadProductPage from './pages/UploadProductPage';
import AdminProductosPendientes from './pages/AdminProductosListado';
import AdminProductoDetalle from './pages/AdminProductoDetalle';
import ColaboradorMisProductos from './pages/ColaboradorMisProductos';
import ColaboradorEditarProducto from './pages/ColaboradorEditarProducto';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogoPage';
import SolicitudCreadorPage from './pages/SolicitudCreadorPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import SobreNosotros from './pages/SobreNosotrosPage';
import CrearUsuarioPage from './pages/CrearUsuarioPage';
import ConfigPerfilPage from './pages/ConfigPerfilPage';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ReviewPaymentsPage from './pages/ReviewPaymentsPage';
import CreatorStatsView from './pages/CreatorStatsView';
import AdminStatsView from './pages/AdminStatsView';
import ContactPage from './pages/Contacto';
import editproduct from './pages/ProductDetailEdit';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, role } = useContext(AuthContext);
  const safeRole = (role || '').toUpperCase();

  return (
    <Router>
      <ToastContainer />

      <Routes>

        {/* — CLIENT ROUTES — */}
        {isAuthenticated && safeRole === 'ROL_CLIENTE' && (
          <Route path="/" element={
            <>
              <HeaderClient />
              <main style={{ marginTop: '72px' }}><Outlet /></main>
              <Footer />
            </>
          }>
            <Route index element={<HomePage />} />
            <Route path="producto/:id" element={<ProductDetail />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="perfil" element={<ConfigPerfilPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="nosotros" element={<SobreNosotros />} />
            <Route path="contacto" element={<ContactPage />} />
            <Route path="terminos" element={<TermsPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          </Route>
        )}

        {/* — STAFF ROUTES — CAMBIADO: Stats como página predeterminada */}
        {isAuthenticated && safeRole === 'ROL_COLABORADOR' && (
          <Route path="/" element={<HeaderStaff />}>
            <Route index element={<Navigate to="/stats/creador" replace />} />
            <Route path="stats/creador" element={<CreatorStatsView />} />
            <Route path="cargarProducto" element={<UploadProductPage />} />
            <Route path="mis-productos" element={<ColaboradorMisProductos />} />
            <Route path="editar-producto/:id" element={<ColaboradorEditarProducto />} />
            <Route path="editar-ficha/:id" element={<editproduct/>} />
            <Route path="perfil" element={<ConfigPerfilPage />} />
            <Route path="*" element={<Navigate to="/stats/creador" replace />} />
            <Route path="terminosYcondiciones" element={<TermsAndConditionsPage />} />
          </Route>
        )}

        {/* — ADMIN ROUTES — CAMBIADO: Stats como página predeterminada */}
        {isAuthenticated && safeRole === 'ROL_ADMIN' && (
          <Route path="/admin" element={<HeaderAdmin />}>
            <Route index element={<Navigate to="stats/admin" replace />} />
            <Route path="stats/admin" element={<AdminStatsView />} />
            <Route path="revisar-productos" element={<AdminProductosPendientes />} />
            <Route path="revisar-productos/:id" element={<AdminProductoDetalle />} />
            <Route path="crearUsuario" element={<CrearUsuarioPage />} />
            <Route path="perfil" element={<ConfigPerfilPage />} />
            <Route path="gestionarUsuarios" element={<AdminManageUsersPage />} />
            <Route path="revisarPagos" element={<ReviewPaymentsPage />} />
            <Route path="*" element={<Navigate to="stats/admin" replace />} />
          </Route>
        )}

        {/* — PUBLIC ROUTES — */}
        <Route element={
          <>
            <HeaderGuest />
            <main style={{ marginTop: '72px' }}><Outlet /></main>
            <Footer />
          </>
        }>
          <Route path="/" element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="terminos" element={<TermsPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="login-colaborador" element={<LoginColab />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="solicitudCreador" element={<SolicitudCreadorPage />} />
          <Route path="terminosYcondiciones" element={<TermsAndConditionsPage />} />
          <Route path="nosotros" element={<SobreNosotros />} />
          <Route path="resetearClave" element={<ForgotPasswordPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

      </Routes>
    </Router>
  );
}