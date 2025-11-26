import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePost, toggleLike } from '../../api/posts';
import { getComments } from '../../api/comments';
import Comment from '../Comment';
import './Post.css';

const Post = ({ post, currentUser, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const isAuthor = currentUser && currentUser.id === post.author.id;

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} д. назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить этот пост?')) {
      return;
    }

    try {
      await deletePost(post.id);
      onDelete(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Не удалось удалить пост');
    }
  };

  const handleLike = async () => {
    try {
      const result = await toggleLike(post.id);
      setIsLiked(result.is_liked);
      setLikesCount(result.likes_count);
      
      onUpdate({
        ...post,
        is_liked: result.is_liked,
        likes_count: result.likes_count
      });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const commentsData = await getComments(post.id);
        setComments(commentsData);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentCreated = (newComment) => {
    setComments(prev => [...prev, newComment]);
    setCommentsCount(prev => prev + 1);
    
    onUpdate({
      ...post,
      comments_count: commentsCount + 1
    });
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setCommentsCount(prev => prev - 1);
    
    onUpdate({
      ...post,
      comments_count: commentsCount - 1
    });
  };

  return (
    <div className="post-card" data-easytag="id4-src/components/Post/index.jsx">
      <div className="post-header">
        <Link to={`/profile/${post.author.id}`} className="post-author-link">
          <div className="post-avatar">
            {getInitials(post.author.first_name, post.author.last_name, post.author.username)}
          </div>
        </Link>
        <div className="post-author-info">
          <Link to={`/profile/${post.author.id}`} className="post-author-name">
            {getAuthorName(post.author)}
          </Link>
          <div className="post-date">{formatDate(post.created_at)}</div>
        </div>
        {isAuthor && (
          <button className="post-delete-button" onClick={handleDelete} title="Удалить пост">
            ✕
          </button>
        )}
      </div>

      <div className="post-content">
        {post.content}
      </div>

      <div className="post-stats">
        {likesCount > 0 && (
          <div className="post-likes-stat">
            <span className="like-icon-small">❤️</span>
            {likesCount}
          </div>
        )}
        <div className="post-stats-spacer"></div>
        {commentsCount > 0 && (
          <div className="post-comments-stat">
            {commentsCount} {commentsCount === 1 ? 'комментарий' : 'комментариев'}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button 
          className={`post-action-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span>Нравится</span>
        </button>
        <button 
          className="post-action-button"
          onClick={handleToggleComments}
        >
          <span className="action-icon">💬</span>
          <span>Комментировать</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          {loadingComments ? (
            <div className="comments-loading">Загрузка комментариев...</div>
          ) : (
            <>
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">Комментариев пока нет</div>
                ) : (
                  comments.map(comment => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onDelete={handleCommentDeleted}
                    />
                  ))
                )}
              </div>
              <Comment
                postId={post.id}
                currentUser={currentUser}
                onCommentCreated={handleCommentCreated}
                isForm
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
