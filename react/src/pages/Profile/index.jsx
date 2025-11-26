import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/profile';
import Post from '../../components/Post';
import EditProfileModal from '../../components/EditProfileModal';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile(id);
      setProfile(data);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return username?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = (profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) {
      return profile.first_name;
    }
    return profile.username;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(prev => ({
      ...prev,
      ...updatedProfile
    }));
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id6-src/pages/Profile/index.jsx">
        <div className="profile-loading">Загрузка профиля...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-container" data-easytag="id6-src/pages/Profile/index.jsx">
        <div className="profile-error">{error || 'Профиль не найден'}</div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id6-src/pages/Profile/index.jsx">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {getInitials(profile.first_name, profile.last_name, profile.username)}
            </div>
          </div>
          <div className="profile-details">
            <div className="profile-name-section">
              <h1 className="profile-name">{getFullName(profile)}</h1>
              {isOwnProfile && (
                <button 
                  className="profile-edit-button"
                  onClick={() => setShowEditModal(true)}
                >
                  Редактировать профиль
                </button>
              )}
            </div>
            <div className="profile-username">@{profile.username}</div>
            {profile.bio && (
              <div className="profile-bio">{profile.bio}</div>
            )}
            <div className="profile-meta">
              <span className="profile-join-date">
                📅 Зарегистрирован {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section-title">
          <h2>Посты</h2>
          <span className="profile-posts-count">{posts.length}</span>
        </div>
        {posts.length === 0 ? (
          <div className="profile-no-posts">
            {isOwnProfile ? 'Вы ещё не создали ни одного поста' : 'Нет постов'}
          </div>
        ) : (
          <div className="profile-posts-list">
            {posts.map(post => (
              <Post
                key={post.id}
                post={{
                  ...post,
                  author: {
                    id: profile.id,
                    username: profile.username,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    avatar_url: profile.avatar_url
                  }
                }}
                currentUser={currentUser}
                onDelete={handlePostDelete}
                onUpdate={handlePostUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
