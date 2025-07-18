// src/services/userApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/users'; // Ajusta si tu puerto o ruta de usuarios es diferente

// axios.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

export const getMyProfile = () => {
  return axios.get(`${API_URL}/me`); // Endpoint para obtener los datos del usuario logueado
};

export const updateMyProfile = (userData) => {
  return axios.put(`${API_URL}/me`, userData);
};

export const deleteMyAccount = (currentPassword) => {
  return axios.delete(`${API_URL}/me`, {
    data: { currentPassword: currentPassword } // Envía la contraseña en el cuerpo para DELETE
  });
};

export const changeMyPassword = (passwordData) => {
  return axios.put(`${API_URL}/me/change-password`, passwordData);
};


export const getAllUsers = () => {
    return axios.get(API_URL); // Endpoint para obtener todos los usuarios (requiere ROL_ADMIN)
  };
  
  export const getUserById = (userId) => {
    return axios.get(`${API_URL}/${userId}`); // Endpoint para obtener un usuario por ID
  };
  
  // userData incluirá nombre, email, rol, y la nueva contraseña temporal si se está reseteando
  export const updateUserByAdmin = (userId, userData) => {
    return axios.put(`${API_URL}/${userId}`, userData); // Endpoint para actualizar un usuario por ID
  };
  
  export const deleteUserByAdmin = (userId) => {
    return axios.delete(`${API_URL}/${userId}`); // Endpoint para eliminar un usuario por ID
  };
  
  // Endpoint específico para resetear contraseña
  export const resetUserPassword = (userId) => {
    return axios.post(`${API_URL}/${userId}/reset-password`); // Backend debe generar y enviar la temporal
  };

export const requestPasswordReset = (username) => {
  return axios.post(`${API_URL}/request-password-reset`, { username });
};
