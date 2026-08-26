import { API_ORIGIN } from '../api/axios';

/**
 * Turn stored paths like `/uploads/photo-123.jpg` into a full URL for <img src>.
 */
export function resolveUploadUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${p}`;
}
