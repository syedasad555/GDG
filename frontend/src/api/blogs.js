import api from './axios';

export const getAllBlogs = (params) => {
  return api.get('/blogs', { params });
};

export const getBlogBySlug = (slug) => {
  return api.get(`/blogs/${slug}`);
};

export const createBlog = (data) => {
  return api.post('/blogs', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateBlog = (id, data) => {
  return api.put(`/blogs/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteBlog = (id) => {
  return api.delete(`/blogs/${id}`);
};

export const likeBlog = (id) => {
  return api.post(`/blogs/${id}/like`);
};

export const addComment = (id, data) => {
  return api.post(`/blogs/${id}/comment`, data);
};

// Admin functions
export const getAllBlogsAdmin = (params) => {
  return api.get('/blogs/admin/all', { params });
};

export const getBlogByIdAdmin = (id) => {
  return api.get(`/blogs/admin/${id}`);
};
