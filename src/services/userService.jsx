import axios from 'axios';

// Usamos la URL pública de tu Gateway
const GATEWAY_BASE_URL = 'https://gateway-production-129e.up.railway.app';

// Crea la instancia de Axios apuntando al Gateway para los servicios de usuarios
export const USERS_API = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/api/users`, // CAMBIO AQUÍ: Apunta al Gateway para usuarios
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Registra un nuevo usuario.
 * @param {{ nombreUsuario: string, clave: string, email: string }} data
 * @returns {Promise}
 */
export function registerUser(payload) {
  // Ahora llama a GATEWAY_BASE_URL/api/users/register
  return USERS_API.post('/register', payload);
}


/**
 * Obtiene la lista de usuarios paginada.
 * @param {number} page
 * @param {number} size
 */
export function listUsers(page = 0, size = 20) {
  // Ahora llama a GATEWAY_BASE_URL/api/users/?page=...&size=...
  return USERS_API.get('/', { params: { page, size } });
}

// Otras funciones CRUD si las necesitas
export function getUser(id)          { return USERS_API.get(`/${id}`); }
export function updateUser(id, data) { return USERS_API.put(`/${id}`, data); }
export function deleteUser(id)       { return USERS_API.delete(`/${id}`); }

export function sendCreatorRequest(data) {
  return USERS_API.post('/solicitud-creador', data);
}