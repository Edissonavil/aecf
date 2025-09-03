// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getCartCount } from '../services/orderApi';

// Cliente Axios para auth
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
  isAuthLoading: true,
  cartItemCount: 0,
  login: async () => {},
  logout: () => {},
  refreshCartCount: async () => {}
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
    isAuthLoading: true,
    cartItemCount: 0
  });

  // Control de refresh en curso y cola de callbacks que esperan el nuevo token
  const isRefreshing = useRef(false);
  const refreshQueue = useRef([]);

  const subscribeTokenRefresh = (cb) => {
    refreshQueue.current.push(cb);
  };
  const onRefreshed = (newToken) => {
    refreshQueue.current.forEach(cb => cb(newToken));
    refreshQueue.current = [];
  };

  // ---- Helpers de Auth ----
  const setAuthHeader = (token) => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  };

  const persistTokens = (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthHeader(null);
  };

  // Llama al endpoint de refresh de tu backend
  // Ajusta si tu backend espera cookies: ej. API.post('/refresh', {}, { withCredentials: true })
  const refreshCall = async (refreshToken) => {
    const { data } = await API.post('/refresh', { refreshToken });
    // Esperamos { accessToken, refreshToken? }
    return data;
  };

  const tryRefreshToken = async (storedRefresh) => {
    if (!storedRefresh) return false;

    // Si ya hay un refresh en curso, suscríbete y espera
    if (isRefreshing.current) {
      return new Promise(resolve => {
        subscribeTokenRefresh((newToken) => resolve(!!newToken));
      });
    }

    isRefreshing.current = true;
    try {
      const resp = await refreshCall(storedRefresh);
      const newAccess = resp.accessToken;
      const newRefresh = resp.refreshToken || storedRefresh;

      persistTokens(newAccess, newRefresh);
      setAuthHeader(newAccess);

      const dec = jwtDecode(newAccess);
      setAuth(a => ({
        ...a,
        isAuthenticated: true,
        role: extractRole(dec),
        username: dec.sub,
        accessToken: newAccess,
        refreshToken: newRefresh
      }));

      onRefreshed(newAccess);
      return true;
    } catch (e) {
      // Refresh falló: limpiar pero no navegar
      clearTokens();
      setAuth(a => ({
        ...a,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null
      }));
      onRefreshed(null);
      return false;
    } finally {
      isRefreshing.current = false;
    }
  };

  // Refresca el contador de items del carrito
  const refreshCartCount = async () => {
  try {
    // 1) intento con /cart/count
    const resp = await getCartCount();
    let nextCount = resp?.data?.count;

    // 2) si no viene "count", caemos al carrito completo
    if (typeof nextCount !== 'number') {
      const full = await getCart(); // { data: { items: [...] } }
      const items = full?.data?.items ?? [];
      // si manejas "quantity" por item:
      nextCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
    }

    setAuth(a => ({ ...a, cartItemCount: nextCount || 0 }));
  } catch (e) {
    console.error('Error al cargar contador de carrito:', e);
    setAuth(a => ({ ...a, cartItemCount: 0 }));
  }
};

  // Inicialización: valida tokens y (si caducó) intenta refresh; carga carrito si procede
  useEffect(() => {
    const initialize = async () => {
      const accessToken  = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const finishAnon = () => setAuth(a => ({ ...a, isAuthLoading: false, isAuthenticated: false }));

      if (!refreshToken) {
        clearTokens();
        return finishAnon();
      }

      if (!accessToken) {
        // Sin access: intenta refresh directo
        const ok = await tryRefreshToken(refreshToken);
        if (!ok) return finishAnon();
        // ya hay auth en estado por tryRefreshToken
        try {
          const res = await getCartCount();
          setAuth(a => ({ ...a, cartItemCount: res.data.count ?? 0, isAuthLoading: false }));
        } catch {
          setAuth(a => ({ ...a, cartItemCount: 0, isAuthLoading: false }));
        }
        return;
      }

      // Hay access: valida
      try {
        const dec = jwtDecode(accessToken);
        const expired = dec.exp < Date.now() / 1000;
        if (expired) {
          const ok = await tryRefreshToken(refreshToken);
          if (!ok) return finishAnon();
        } else {
          setAuthHeader(accessToken);
          setAuth(a => ({
            ...a,
            isAuthenticated: true,
            role: extractRole(dec),
            username: dec.sub,
            accessToken,
            refreshToken
          }));
        }
        try {
          const res = await getCartCount();
          setAuth(a => ({ ...a, cartItemCount: res.data.count ?? 0, isAuthLoading: false }));
        } catch {
          setAuth(a => ({ ...a, cartItemCount: 0, isAuthLoading: false }));
        }
      } catch {
        // Token corrupto: intenta refresh
        const ok = await tryRefreshToken(refreshToken);
        if (!ok) return finishAnon();
        try {
          const res = await getCartCount();
          setAuth(a => ({ ...a, cartItemCount: res.data.count ?? 0, isAuthLoading: false }));
        } catch {
          setAuth(a => ({ ...a, cartItemCount: 0, isAuthLoading: false }));
        }
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interceptor global: reintenta la request original tras refresh
  useEffect(() => {
    const id = axios.interceptors.response.use(
      response => response,
      async error => {
        const status = error?.response?.status;
        const original = error?.config;
        if ((status === 401 || status === 403) && original && !original._retry) {
          original._retry = true;
          const rt = localStorage.getItem('refreshToken');
          const ok = await tryRefreshToken(rt);
          if (ok) {
            original.headers = original.headers || {};
            original.headers['Authorization'] = axios.defaults.headers.common['Authorization'];
            return axios(original);
          }
          // Si no se pudo refrescar: no navegamos; devolvemos error para que la UI decida
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- API expuesta ----
  const login = async (nombreUsuario, clave) => {
    const { data } = await API.post('/login', { nombreUsuario, clave });
    const { accessToken, refreshToken } = data;
    persistTokens(accessToken, refreshToken);
    setAuthHeader(accessToken);
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
    clearTokens();
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

export const useAuth = () => useContext(AuthContext);
