/**
 * Turn stored paths like `/uploads/photo-123.jpg` into a full URL for <img src>.
 */
export function resolveUploadUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
