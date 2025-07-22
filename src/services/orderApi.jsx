// src/services/orderApi.jsx

import axios from 'axios';

// Usamos la URL pública de tu Gateway
const GATEWAY_BASE_URL = 'https://gateway-production-129e.up.railway.app';

// CART_API ahora apunta al Gateway, y el Gateway se encargará de enrutar a /api/orders/cart
export const CART_API = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/api/orders/cart`,
  headers: { 'Content-Type': 'application/json' }
});

CART_API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GET  /api/orders/cart  (Se convierte en GATEWAY_BASE_URL/api/orders/cart)
 */
export function getCart() {
  return CART_API.get(``);
}

/**
 * GET  /api/orders/cart/count (Se convierte en GATEWAY_BASE_URL/api/orders/cart/count)
 */
export function getCartCount() {
  return CART_API.get('/count');
}

/**
 * POST /api/orders/cart/{productId}?precio=… (Se convierte en GATEWAY_BASE_URL/api/orders/cart/{productId}?precio=…)
 */
export function addToCart(productId, precioUnitario) {
  return CART_API.post(
    `/${productId}`,
    null,
    { params: { precio: precioUnitario } }
  );
}

// DELETE /api/cart/{productId} (Se convierte en GATEWAY_BASE_URL/api/orders/cart/{productId})
export function removeFromCart(productId) {
    return CART_API.delete(`/${productId}`);
}

// ORDER_API ahora apunta al Gateway, y el Gateway se encargará de enrutar a /api/orders
export const ORDER_API = axios.create({
    baseURL: `${GATEWAY_BASE_URL}/api/orders`,
    headers: { 'Content-Type': 'application/json' }
});

ORDER_API.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const createManualOrder = async (request) => {
  return ORDER_API.post(`/manual`, request);
};

export const uploadReceiptForOrder = async (orderId, formData) => {
    return ORDER_API.post(`/${orderId}/receipt`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getOrdersPendingReceiptReview = async (page = 0, size = 10) => {
  return ORDER_API.get(`/pending-receipts?page=${page}&size=${size}`);
};

export const reviewManualPayment = async (orderId, approve, comment) => {
    return ORDER_API.put(`/admin/orders/${orderId}/review-payment?approve=${approve}`, { comment });
};

/** GET Blob de descarga */
export function downloadOrder(orderId) {
    // Llama a GET /api/orders/{orderId}/download (Se convierte en GATEWAY_BASE_URL/api/orders/{orderId}/download)
    return ORDER_API.get(`/${orderId}/download`, { responseType: 'blob' });
}

export const downloadOrderBlob = (downloadUrl) => {
  // Si 'downloadUrl' es una URL absoluta (ej. https://gateway-production-129e.up.railway.app/api/files/download/...),
  // axios ignorará la baseURL de ORDER_API y usará directamente downloadUrl.
  // Esto es lo correcto si order-service-deploy te devuelve la URL completa para el file-service.
  return ORDER_API.get(downloadUrl, { responseType: 'arraybuffer' });
};