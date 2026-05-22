import api from './axios';

export const fetchAdminStats   = ()     => api.get('/admin/stats');
export const fetchAdminAgents  = ()     => api.get('/admin/agents');
export const fetchAdminOrders  = (params) => api.get('/orders', { params });
export const fetchAdminProducts = ()    => api.get('/products/admin/all');
export const createProduct     = (data) => api.post('/products', data);
export const updateProduct     = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct     = (id)   => api.delete(`/products/${id}`);
export const assignAgentToOrder = (orderId, agentId) =>
  api.patch(`/orders/${orderId}/assign`, { agentId });
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });