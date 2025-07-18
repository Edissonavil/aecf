// src/services/productApi.js
import axios from 'axios';

// 1) Instancia principal
export const PRODUCTS_API = axios.create({
  baseURL: 'http://localhost:8083/api/products',
  headers: { 'Content-Type': 'application/json' }
});

// 2) Inyectar token en defaults en cada solicitud
PRODUCTS_API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3) Interceptor de respuesta para logout en 401/403
PRODUCTS_API.interceptors.response.use(
  res => res,
  err => {
    if (err.response && [401, 403].includes(err.response.status)) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * GET /{id}
 */
export function getProductById(id) {
  return PRODUCTS_API.get(`${id}`);
}

/**
 * POST /
 * body: FormData
 */
export function createProduct(formData) {
  return PRODUCTS_API.post(
    '',            // sin slash al principio
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

/**
 * PUT /{id}/decision
 * body: { aprobar: boolean, comentario?: string }
 */
export function decideProduct(id, aprobar, comentario) {
  return PRODUCTS_API.put(
    `${id}/decision`,
    { aprobar, comentario }
  );
}

/**
 * GET /pending?page=…&size=…
 */
export function listPendingProducts(page = 0, size = 50) {
  return PRODUCTS_API.get(`pending`, { params: { page, size } });
}

/**
 * GET /?estado=…&page=…&size=…
 */
export function getProductsByStatus(estado, page = 0, size = 50) {
  return PRODUCTS_API.get('', { params: { estado, page, size } });
}

/**
 * GET /?page=…&size=…
 */
export function getAllProducts(page = 0, size = 50) {
  return PRODUCTS_API.get('', { params: { page, size } });
}

/**
 * GET /my-products?page=…&size=…
 */
export function getMyProducts(page = 0, size = 50) {
  return PRODUCTS_API.get(`my-products`, { params: { page, size } });
}

/**
 * PUT /{id}
 */
export function updateProduct(id, productData) {
  return PRODUCTS_API.put(`${id}`, productData);
}

/**
 * DELETE /{id}
 */
export function deleteProduct(id) {
  return PRODUCTS_API.delete(`${id}`);
}
