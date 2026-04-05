import api from './axios';

export const getAllEvents = (params) => {
  return api.get('/events', { params });
};

export const getEventById = (id) => {
  return api.get(`/events/${id}`);
};

export const getUpcomingEvents = () => {
  return api.get('/events/upcoming');
};

export const getPastEvents = () => {
  return api.get('/events/past');
};

export const createEvent = (data) => {
  return api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateEvent = (id, data) => {
  return api.put(`/events/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteEvent = (id) => {
  return api.delete(`/events/${id}`);
};

export const registerEvent = (id, data) => {
  return api.post(`/events/${id}/register`, data);
};

export const saveEvent = (id) => {
  return api.post(`/events/${id}/save`);
};

export const unsaveEvent = (id) => {
  return api.delete(`/events/${id}/save`);
};
