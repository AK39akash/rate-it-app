import api from './api';

const adminService = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Stores
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (storeData) => api.post('/admin/stores', storeData),
  updateStore: (id, storeData) => api.put(`/admin/stores/${id}`, storeData),
  deleteStore: (id) => api.delete(`/admin/stores/${id}`),
};

export default adminService;
