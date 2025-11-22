import axios from 'axios';

// Cliente Axios compartido para toda la app
// - baseURL: punto de entrada del backend
// - interceptor request: agrega Authorization si existe token en localStorage
// - interceptor response: maneja 401 redirigiendo al login

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: añadir token si existe
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // no hacemos nada si localStorage falla
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor de response: si recibimos 401, limpiar token y redirigir a login
api.interceptors.response.use(
  (resp) => resp, 
  (error) => {
    const status = error?.response?.status;
    
    // Detectamos si el error viene del endpoint de login
    const esLogin = error.config.url.includes('/login');

<<<<<<< HEAD
    // Solo redirigimos si es 401/403 Y NO es un intento de login fallido
    if ((status === 401 || status === 403) && !esLogin) {
      console.warn("Sesión expirada. Redirigiendo al login...");
      try { localStorage.removeItem('token'); } catch (e) {}
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);
export default api;
=======
export default api;
>>>>>>> origin/franrama
