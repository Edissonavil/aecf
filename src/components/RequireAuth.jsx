// src/components/RequireAuth.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ allowed }) {
  const { isAuthenticated, role, isAuthLoading } = useAuth();

  if (isAuthLoading) return null;                // opcional: loader

  if (!isAuthenticated || !allowed.includes(role))
    return <Navigate to="/login" replace />;     // o "/"

  return <Outlet />;
}
