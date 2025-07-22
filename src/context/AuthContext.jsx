// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'; // ¡Asegúrate de importar 'useContext'!
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { getCartCount } from '../services/orderApi';

// Cliente Axios para auth (este está bien)
const API = axios.create({
  baseURL: 'https://gateway-production-129e.up.railway.app/api/auth',
  headers: { 'Content-Type': 'application/json' }
});

export const AuthContext = createContext({
  isAuthenticated: false,
  role: null,
  username: null,
  accessToken: null,
  refreshToken: null,
  isAuthLoading: true, // true al inicio mientras se carga el estado de auth
  cartItemCount: 0,
  login: async () => {},
  logout: () => {},
  refreshCartCount: async () => {} // Añadir aquí también
});

const extractRole = decoded =>
  (decoded.role || decoded.rol || decoded.roles?.[0] || '')
    .toString()
    .toUpperCase();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    username: null,
    accessToken: null,
    refreshToken: null,
    isAuthLoading: true, // Estado de carga para la inicialización
    cartItemCount: 0
  });

  // Refresca el contador de items del carrito
  const refreshCartCount = async () => {
    try {
      // Usa la función importada de orderApi.jsx
      const resp = await getCartCount();
      // Supongo que tu endpoint devuelve { count: number }
      setAuth(a => ({ ...a, cartItemCount: resp.data.count }));
    } catch (e) {
      console.error('Error al cargar contador de carrito:', e);
      setAuth(a => ({ ...a, cartItemCount: 0 }));
    }
  };

  // Inicializa auth y, si hay token válido, carga el contador
  useEffect(() => {
    const initialize = async () => {
      const accessToken  = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        try {
          const dec = jwtDecode(accessToken);
          if (dec.exp < Date.now() / 1000) throw new Error('Token expirado');

          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          setAuth(a => ({
            ...a,
            isAuthenticated: true,
            role: extractRole(dec),
            username: dec.sub,
            accessToken,
            refreshToken,
            isAuthLoading: false
          }));

          // **AQUÍ** obtenemos el count del carrito
          try {
            // Usa la función importada de orderApi.jsx
            const res = await getCartCount();
            setAuth(a => ({ ...a, cartItemCount: res.data.count }));
          } catch {
            setAuth(a => ({ ...a, cartItemCount: 0 }));
          }

        } catch {
          localStorage.clear();
          delete axios.defaults.headers.common['Authorization'];
          setAuth(a => ({
            ...a,
            isAuthLoading: false,
            isAuthenticated: false
          }));
        }
      } else {
        setAuth(a => ({ ...a, isAuthLoading: false }));
      }
    };

    initialize();
  }, []);

  const login = async (nombreUsuario, clave) => {
    const { data } = await API.post('/login', { nombreUsuario, clave });
    const { accessToken, refreshToken } = data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    const dec = jwtDecode(accessToken);
    setAuth(a => ({
      ...a,
      isAuthenticated: true,
      role: extractRole(dec),
      username: dec.sub,
      accessToken,
      refreshToken,
      isAuthLoading: false
    }));
    await refreshCartCount();
    return extractRole(dec);
  };

  const logout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setAuth({
      isAuthenticated: false,
      role: null,
      username: null,
      accessToken: null,
      refreshToken: null,
      isAuthLoading: false,
      cartItemCount: 0
    });
  };

  return (
    <AuthContext.Provider value={{
      ...auth,
          authToken: auth.accessToken,
          login,
          logout,
          refreshCartCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- ¡Añade este hook al final del archivo! ---
export const useAuth = () => {
  return useContext(AuthContext);
};