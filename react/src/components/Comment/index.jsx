import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createComment, deleteComment } from '../../api/comments';
import './Comment.css';

const Comment = ({ comment, postId, currentUser, onDelete, onCommentCreated, isForm }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isForm) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!content.trim()) {
        return;
      }

      setSubmitting(true);
      try {
        const newComment = await createComment(postId, { content });
        setContent('');
        onCommentCreated(newComment);
      } catch (err) {
        console.error('Failed to create comment:', err);
        alert('Не удалось создать комментарий');
      } finally {
        setSubmitting(false);
      }
    };

    const getInitials = () => {
      if (currentUser?.first_name && currentUser?.last_name) {
        return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
      }
      if (currentUser?.first_name) {
        return currentUser.first_name[0].toUpperCase();
      }
      return currentUser?.username?.[0]?.toUpperCase() || 'U';
    };

    return (
      <div className="comment-form-container">
        <div className="comment-form-avatar">
          {getInitials()}
        </div>
        <form onSubmit={handleSubmit} className="comment-form">
          <input
            type="text"
            className="comment-input"
            placeholder="Напишите комментарий..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
          {content.trim() && (
            <button 
              type="submit" 
              className="comment-submit-button"
              disabled={submitting}
            >
              {submitting ? '...' : '➤'}
            </button>
          )}
        </form>
      </div>
    );
  }

  const isAuthor = currentUser && currentUser.id === comment.author.id;

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return username?.[0]?.toUpperCase() || 'U';
  };

  const getAuthorName = (author) => {
    if (author.first_name && author.last_name) {
      return `${author.first_name} ${author.last_name}`;
    }
    if (author.first_name) {
      return author.first_name;
    }
    return author.username;
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить этот комментарий?')) {
      return;
    }

    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Не удалось удалить комментарий');
    }
  };

  return (
    <div className="comment-item" data-easytag="id5-src/components/Comment/index.jsx">
      <Link to={`/profile/${comment.author.id}`} className="comment-avatar-link">
        <div className="comment-avatar">
          {getInitials(comment.author.first_name, comment.author.last_name, comment.author.username)}
        </div>
      </Link>
      <div className="comment-content-wrapper">
        <div className="comment-bubble">
          <Link to={`/profile/${comment.author.id}`} className="comment-author-name">
            {getAuthorName(comment.author)}
          </Link>
          <div className="comment-text">{comment.content}</div>
        </div>
        <div className="comment-actions">
          {isAuthor && (
            <button className="comment-delete-button" onClick={handleDelete}>
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
