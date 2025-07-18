// src/api/products.js
import axios from 'axios';

const PRODUCTS_API = axios.create({
  baseURL: process.env.REACT_APP_PRODUCTS_URL || 'http://localhost:8083/api/products',
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta siempre el token si existe
PRODUCTS_API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default PRODUCTS_API;
