import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Auth ============
export const loginAPI = (data) => API.post('/auth/login', data);
export const demoLoginAPI = () => API.post('/auth/demo');
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');
export const updateProfileAPI = (data) => API.put('/auth/me', data);

// ============ Accounts ============
export const getAccountsAPI = () => API.get('/accounts');
export const getAccountDetailsAPI = (id) => API.get(`/accounts/${id}`);
export const createAccountAPI = (data) => API.post('/accounts', data);

// ============ Transactions ============
export const depositAPI = (data) => API.post('/transactions/deposit', data);
export const withdrawAPI = (data) => API.post('/transactions/withdraw', data);
export const transferAPI = (data) => API.post('/transactions/transfer', data);
export const getTransactionsAPI = (params) => API.get('/transactions', { params });

// ============ Loans ============
export const applyLoanAPI = (data) => API.post('/loans', data);
export const getLoansAPI = () => API.get('/loans');
export const getLoanByIdAPI = (id) => API.get(`/loans/${id}`);

// ============ Admin ============
export const getAllUsersAPI = () => API.get('/admin/users');
export const getAllTransactionsAPI = (params) => API.get('/admin/transactions', { params });
export const getDashboardStatsAPI = () => API.get('/admin/stats');
export const toggleUserStatusAPI = (id) => API.put(`/admin/users/${id}/toggle`);
export const deleteUserAPI = (id) => API.delete(`/admin/users/${id}`);
export const getAllLoansAPI = (params) => API.get('/loans/admin/all', { params });
export const approveLoanAPI = (id) => API.put(`/loans/${id}/approve`);
export const rejectLoanAPI = (id, data) => API.put(`/loans/${id}/reject`, data);

export default API;
