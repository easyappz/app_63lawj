import instance from './axios';

/**
 * Get paginated list of posts
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 20)
 * @returns {Promise} Response with paginated posts
 */
export const getPosts = async (page = 1, pageSize = 20) => {
  const response = await instance.get('/api/posts/', {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

/**
 * Create a new post
 * @param {Object} data - Post data
 * @param {string} data.content - Post content
 * @returns {Promise} Response with created post
 */
export const createPost = async (data) => {
  const response = await instance.post('/api/posts/', data);
  return response.data;
};

/**
 * Get a single post by ID
 * @param {number} id - Post ID
 * @returns {Promise} Response with post details
 */
export const getPost = async (id) => {
  const response = await instance.get(`/api/posts/${id}/`);
  return response.data;
};

/**
 * Delete a post
 * @param {number} id - Post ID
 * @returns {Promise} Response
 */
export const deletePost = async (id) => {
  const response = await instance.delete(`/api/posts/${id}/`);
  return response.data;
};

/**
 * Toggle like status for a post
 * @param {number} id - Post ID
 * @returns {Promise} Response with updated like status
 */
export const toggleLike = async (id) => {
  const response = await instance.post(`/api/posts/${id}/like/`);
  return response.data;
};
