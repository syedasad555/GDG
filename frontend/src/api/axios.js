import axios from 'axios';

/** Full API base, e.g. https://backend.onrender.com/api */
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(
  /\/+$/,
  ''
);

/** Server origin without /api, for /uploads and raw axios /api/... paths */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

axios.defaults.baseURL = API_ORIGIN;
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

/** Paths like `/events` must not start with `/` or axios ignores baseURL's `/api`. */
const normalizeApiPath = (config) => {
  if (config.url?.startsWith('/')) {
    config.url = config.url.slice(1);
  }
  return config;
};

const onRequest = (config) => attachToken(normalizeApiPath(config));

api.interceptors.request.use(onRequest, (error) => Promise.reject(error));
axios.interceptors.request.use(attachToken, (error) => Promise.reject(error));

const onUnauthorized = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, onUnauthorized);
axios.interceptors.response.use((response) => response, onUnauthorized);

export default api;
