// src/services/productApi.js
import axios from 'axios';

// Usamos la URL pública de tu Gateway
const GATEWAY_BASE_URL = 'https://gateway-production-129e.up.railway.app';

// 1) Instancia principal
// PRODUCTS_API ahora apunta al Gateway, y el Gateway se encargará de enrutar a /api/products
export const PRODUCTS_API = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/api/products`, // CAMBIO AQUÍ: Apunta al Gateway
  headers: { 'Content-Type': 'application/json' } // Este es el default, se sobrescribe para FormData
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
 * GET /{id} (Se convierte en GATEWAY_BASE_URL/api/products/{id})
 */
export function getProductById(id) {
  return PRODUCTS_API.get(`${id}`);
}

/**
 * POST / (Se convierte en GATEWAY_BASE_URL/api/products)
 * body: FormData
 */
export function createProduct(formData) {
  return PRODUCTS_API.post(
    '',            // sin slash al principio
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } } // Correcto para FormData
  );
}

/**
 * PUT /{id}/decision (Se convierte en GATEWAY_BASE_URL/api/products/{id}/decision)
 * body: { aprobar: boolean, comentario?: string }
 */
export function decideProduct(id, aprobar, comentario) {
  return PRODUCTS_API.put(
    `${id}/decision`,
    { aprobar, comentario }
  );
}

/**
 * GET /pending?page=…&size=… (Se convierte en GATEWAY_BASE_URL/api/products/pending?page=…&size=…)
 */
export function listPendingProducts(page = 0, size = 50) {
  return PRODUCTS_API.get(`pending`, { params: { page, size } });
}

/**
 * GET /?estado=…&page=…&size=… (Se convierte en GATEWAY_BASE_URL/api/products?estado=…&page=…&size=…)
 */
export function getProductsByStatus(estado, page = 0, size = 50) {
  return PRODUCTS_API.get('', { params: { estado, page, size } });
}

/**
 * GET /?page=…&size=… (Se convierte en GATEWAY_BASE_URL/api/products?page=…&size=…)
 */
export function getAllProducts(page = 0, size = 50) {
  return PRODUCTS_API.get('', { params: { page, size } });
}

/**
 * GET /my-products?page=…&size=… (Se convierte en GATEWAY_BASE_URL/api/products/my-products?page=…&size=…)
 */
export function getMyProducts(page = 0, size = 50) {
  return PRODUCTS_API.get(`my-products`, { params: { page, size } });
}

/**
 * PUT /{id} (Se convierte en GATEWAY_BASE_URL/api/products/{id})
 * body: FormData
 */
export function updateProduct(id, productData) {
  return PRODUCTS_API.put(
    `${id}`,
    productData,
    { headers: { 'Content-Type': 'multipart/form-data' } } // <-- CORRECCIÓN AQUÍ
  );
}

/**
 * DELETE /{id} (Se convierte en GATEWAY_BASE_URL/api/products/{id})
 */
export function deleteProduct(id) {
  return PRODUCTS_API.delete(`${id}`);
}