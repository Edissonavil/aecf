import axios from 'axios';

const USERS_API = axios.create({
  baseURL: 'http://localhost:8081/api/users',
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Registra un nuevo usuario.
 * @param {{ nombreUsuario: string, clave: string, email: string }} data
 * @returns {Promise}
 */
export function registerUser(payload) {
  // Llamamos **solo** a "/users/register"
  return USERS_API.post('/register', payload);
}


/**
 * Obtiene la lista de usuarios paginada.
 * @param {number} page
 * @param {number} size
 */
export function listUsers(page = 0, size = 20) {
  return USERS_API.get('/', { params: { page, size } });
}

// Otras funciones CRUD si las necesitas
export function getUser(id)          { return USERS_API.get(`/${id}`); }
export function updateUser(id, data) { return USERS_API.put(`/${id}`, data); }
export function deleteUser(id)       { return USERS_API.delete(`/${id}`); }

export function sendCreatorRequest(data) {
  return USERS_API.post('/solicitud-creador', data);
}
