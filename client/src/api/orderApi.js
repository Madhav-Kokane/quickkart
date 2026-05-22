import api from './axios';

export const createRazorpayOrder = (amount)       => api.post('/payment/create-order', { amount });
export const verifyPayment       = (data)          => api.post('/payment/verify', data);
export const placeOrder          = (data)          => api.post('/orders', data);
export const fetchMyOrders       = ()              => api.get('/orders/my');
export const fetchOrderById      = (id)            => api.get(`/orders/${id}`);
export const fetchAllOrders      = (params)        => api.get('/orders', { params });
export const fetchAssignedOrders = ()              => api.get('/orders/assigned');
export const updateOrderStatus   = (id, status)    => api.patch(`/orders/${id}/status`, { status });
export const assignAgent         = (id, agentId)   => api.patch(`/orders/${id}/assign`, { agentId });