import instance from './axios';

/**
 * Get user profile by ID
 * @param {number} id - User ID
 * @returns {Promise} Response with user profile and posts
 */
export const getProfile = async (id) => {
  const response = await instance.get(`/api/profile/${id}/`);
  return response.data;
};

/**
 * Update current user's profile
 * @param {Object} data - Profile data to update
 * @param {string} data.first_name - First name
 * @param {string} data.last_name - Last name
 * @param {string} data.bio - User bio
 * @param {string} data.avatar_url - Avatar URL
 * @returns {Promise} Response with updated profile
 */
export const updateProfile = async (data) => {
  const response = await instance.patch('/api/profile/', data);
  return response.data;
};
