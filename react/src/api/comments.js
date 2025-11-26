import instance from './axios';

/**
 * Get all comments for a specific post
 * @param {number} postId - Post ID
 * @returns {Promise} Response with list of comments
 */
export const getComments = async (postId) => {
  const response = await instance.get(`/api/posts/${postId}/comments/`);
  return response.data;
};

/**
 * Create a new comment for a post
 * @param {number} postId - Post ID
 * @param {Object} data - Comment data
 * @param {string} data.content - Comment content
 * @returns {Promise} Response with created comment
 */
export const createComment = async (postId, data) => {
  const response = await instance.post(`/api/posts/${postId}/comments/`, data);
  return response.data;
};

/**
 * Delete a comment
 * @param {number} id - Comment ID
 * @returns {Promise} Response
 */
export const deleteComment = async (id) => {
  const response = await instance.delete(`/api/comments/${id}/`);
  return response.data;
};
