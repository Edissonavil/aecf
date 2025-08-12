// src/services/productService.js
import axios from 'axios';

// Usamos la URL pública de tu Gateway
const GATEWAY_BASE_URL = 'https://gateway-production-129e.up.railway.app';

// Instancia base para Product Service
export const PRODUCTS_API = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/api/products`, // CAMBIO AQUÍ: Apunta al Gateway
  headers: {} // Deja el objeto de headers vacío por defecto para que Axios maneje Content-Type
});

// Inyectar Authorization header desde axios.defaults o localStorage
PRODUCTS_API.interceptors.request.use(config => {
  const globalAuth = axios.defaults.headers.common['Authorization'];
  if (globalAuth) {
    config.headers['Authorization'] = globalAuth;
  } else {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Manejo de 401/403 → logout forzado
PRODUCTS_API.interceptors.response.use(
  res => res,
  err => {
    if (err.response && [401, 403].includes(err.response.status)) {
      err.isAuthError = true;
    }
    return Promise.reject(err);
  }
);


/** * Crea un nuevo producto (multipart/form-data)
 * @param {FormData} formData
 */
export function createProduct(formData) {
  return PRODUCTS_API.post('', formData, {
    headers: {},
    __skipAuthRedirect: true
  });
}


/** * Obtiene la página de productos subidos por el colaborador
 */
export function getMyProducts(page = 0, size = 50) {
  return PRODUCTS_API.get('/my-products', { params: { page, size } });
}

/** * Lista productos pendientes (solo admin)
 */
export function listPendingProducts(page = 0, size = 50) {
  return PRODUCTS_API.get('/pending', { params: { page, size } });
}

/** * Obtiene un producto por ID
 */
export function getProductById(id) {
  return PRODUCTS_API.get(`/${id}`);
}

/** * Aprueba o rechaza un producto (admin)
 * @param {number} id
 * @param {boolean} aprobar
 * @param {string} comentario (opcional)
 */
export function decideProduct(id, aprobar, comentario) {
  const params = new URLSearchParams();
  params.append('aprobar', aprobar.toString());
  if (comentario) params.append('comentario', comentario);
  return PRODUCTS_API.put(`/${id}/decision?${params.toString()}`);
}

/** * Actualiza datos textuales de un producto (collaborator) o también con archivos
 * @param {number} id - El ID del producto a actualizar.
 * @param {object | FormData} data - Si es solo datos textuales, un objeto. Si incluye archivos, un FormData.
 */
export function updateProduct(id, data) {
  return PRODUCTS_API.put(`/${id}`, data);
}

/** * Elimina un producto
 */
export function deleteProduct(id) {
  return PRODUCTS_API.delete(`/${id}`);
}

/** * Obtiene todos o filtra por estado
 */
export function getAllProducts(page = 0, size = 50, estado) {
  const params = { page, size };
  if (estado) params.estado = estado;
  return PRODUCTS_API.get('', { params });
}