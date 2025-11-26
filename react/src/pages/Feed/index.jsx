import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPosts, createPost } from '../../api/posts';
import Post from '../../components/Post';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await getPosts(pageNum, 20);
      
      if (append) {
        setPosts(prev => [...prev, ...data.results]);
      } else {
        setPosts(data.results);
      }
      
      setHasMore(!!data.next);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Не удалось загрузить посты');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(1, false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    try {
      setError(null);
      const newPost = await createPost({ content });
      setPosts(prev => [newPost, ...prev]);
      setContent('');
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Не удалось создать пост');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  return (
    <div className="feed-container" data-easytag="id3-src/pages/Feed/index.jsx">
      <div className="feed-content">
        <div className="create-post-section">
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="create-post-avatar">
              <div className="avatar-placeholder">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
            </div>
            <div className="create-post-input-wrapper">
              <textarea
                className="create-post-input"
                placeholder="Что у вас нового?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
              <button 
                type="submit" 
                className="create-post-button"
                disabled={!content.trim()}
              >
                Опубликовать
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="feed-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="feed-loading">Загрузка...</div>
        ) : (
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="no-posts">Постов пока нет. Создайте первый!</div>
            ) : (
              posts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onDelete={handlePostDeleted}
                  onUpdate={handlePostUpdated}
                />
              ))
            )}
          </div>
        )}

        {hasMore && posts.length > 0 && (
          <div className="load-more-section">
            <button 
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
