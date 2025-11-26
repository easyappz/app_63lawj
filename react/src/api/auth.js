import instance from './axios';

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.email - User email
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @param {string} data.first_name - First name
 * @param {string} data.last_name - Last name
 * @returns {Promise} Response with user data
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register/', data);
  return response.data;
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.email - User email
 * @param {string} data.password - Password
 * @returns {Promise} Response with user data
 */
export const login = async (data) => {
  const response = await instance.post('/api/auth/login/', data);
  return response.data;
};

/**
 * Logout current user
 * @returns {Promise} Response with logout message
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};

/**
 * Get current authenticated user data
 * @returns {Promise} Response with current user data
 */
export const getMe = async () => {
  const response = await instance.get('/api/auth/me/');
  return response.data;
};
