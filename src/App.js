// src/App.js
import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import HeaderGuest   from './components/HeaderGuest';
import HeaderClient  from './components/HeaderClient';
import HeaderStaff   from './components/HeaderStaff';
import HeaderAdmin   from './components/HeaderAdmin';
import Footer        from './components/Footer';

import HomePage      from './pages/HomePage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import TermsPage     from './pages/TermsPage';
import LoginColab    from './pages/LoginColab';
import UploadProductPage  from './pages/UploadProductPage';
import AdminProductosPendientes from './pages/AdminProductosListado';
import AdminProductoDetalle     from './pages/AdminProductoDetalle';
import ColaboradorMisProductos  from './pages/ColaboradorMisProductos';
import ColaboradorEditarProducto from './pages/ColaboradorEditarProducto';
import PrivacyPolicyPage        from './pages/PrivacyPolicyPage';
import ProductDetail  from './pages/ProductDetail';
import CartPage       from './pages/CartPage';
import CatalogPage    from './pages/CatalogoPage';
import SolicitudCreadorPage from './pages/SolicitudCreadorPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import SobreNosotros from './pages/SobreNosotrosPage';
import CrearUsuarioPage from './pages/CrearUsuarioPage';
import ConfigPerfilPage from './pages/ConfigPerfilPage';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import ForgotPasswordPage   from './pages/ForgotPasswordPage';
import ReviewPaymentsPage   from './pages/ReviewPaymentsPage';
import CreatorStatsView     from './pages/CreatorStatsView';
import AdminStatsView       from './pages/AdminStatsView';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from './context/AuthContext';

// Componente de carga simple
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }}></div>
      <p style={{ color: '#666', fontSize: '16px' }}>Cargando...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

export default function App() {
  const { isAuthenticated, role, isAuthLoading } = useContext(AuthContext);
  const safeRole = (role || '').toUpperCase();

  // Mostrar pantalla de carga mientras se inicializa la autenticación
  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <ToastContainer />

      <Routes>

        {/* — CLIENT ROUTES — */}
        {isAuthenticated && safeRole === 'ROL_CLIENTE' && (
          <Route path="/" element={
            <>
              <HeaderClient />
              <main style={{ marginTop: '72px' }}><Outlet/></main>
              <Footer />
            </>
          }>
            <Route index element={<HomePage />} />
            <Route path="producto/:id" element={<ProductDetail />} />
            <Route path="cart"           element={<CartPage />} />
            <Route path="perfil"         element={<ConfigPerfilPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Route>
        )}

        {/* — STAFF ROUTES — */}
        {isAuthenticated && safeRole === 'ROL_COLABORADOR' && (
          <Route path="/" element={<HeaderStaff />}>
            <Route index                   element={<Navigate to="/cargarProducto" replace />} />
            <Route path="cargarProducto"   element={<UploadProductPage />} />
            <Route path="mis-productos"    element={<ColaboradorMisProductos />} />
            <Route path="editar-producto/:id" element={<ColaboradorEditarProducto />} />
            <Route path="perfil"           element={<ConfigPerfilPage />} />
            <Route path="stats/creador"    element={<CreatorStatsView />} />
            <Route path="*"                element={<Navigate to="/cargarProducto" replace />} />
          </Route>
        )}

        {/* — ADMIN ROUTES — */}
        {isAuthenticated && safeRole === 'ROL_ADMIN' && (
          <Route path="/admin" element={<HeaderAdmin />}>
            <Route index                       element={<Navigate to="revisar-productos" replace />} />
            <Route path="revisar-productos"    element={<AdminProductosPendientes />} />
            <Route path="revisar-productos/:id" element={<AdminProductoDetalle />} />
            <Route path="crearUsuario"         element={<CrearUsuarioPage />} />
            <Route path="perfil"               element={<ConfigPerfilPage />} />
            <Route path="gestionarUsuarios"    element={<AdminManageUsersPage />} />
            <Route path="revisarPagos"         element={<ReviewPaymentsPage />} />
            <Route path="stats/admin"          element={<AdminStatsView />} />
            <Route path="*"                    element={<Navigate to="revisar-productos" replace />} />
          </Route>
        )}

        {/* — REDIRECT PARA ADMIN EN RUTA RAÍZ — */}
        {isAuthenticated && safeRole === 'ROL_ADMIN' && (
          <Route path="/" element={<Navigate to="/admin" replace />} />
        )}

        {/* — PUBLIC ROUTES — Solo se muestran cuando NO está autenticado */}
        {!isAuthenticated && (
          <Route element={
            <>
              <HeaderGuest />
              <main style={{ marginTop: '72px' }}><Outlet/></main>
              <Footer />
            </>
          }>
            <Route path="/"                    element={<HomePage />} />
            <Route path="login"               element={<LoginPage />} />
            <Route path="registro"            element={<RegisterPage />} />
            <Route path="terminos"            element={<TermsPage />} />
            <Route path="privacy-policy"      element={<PrivacyPolicyPage />} />
            <Route path="login-colaborador"   element={<LoginColab />} />
            <Route path="producto/:id"        element={<ProductDetail />} />
            <Route path="catalog"             element={<CatalogPage />} />
            <Route path="solicitudCreador"    element={<SolicitudCreadorPage />} />
            <Route path="terminosYcondiciones" element={<TermsAndConditionsPage />} />
            <Route path="nosotros"            element={<SobreNosotros />} />
            <Route path="resetearClave"       element={<ForgotPasswordPage />} />
            <Route path="*"                   element={<Navigate to="/" replace />} />
          </Route>
        )}

        {/* — FALLBACK para rutas no manejadas cuando está autenticado — */}
        {isAuthenticated && (
          <Route path="*" element={
            safeRole === 'ROL_ADMIN' ? <Navigate to="/admin" replace /> :
            safeRole === 'ROL_COLABORADOR' ? <Navigate to="/cargarProducto" replace /> :
            <Navigate to="/" replace />
          } />
        )}

      </Routes>
    </Router>
  );

}