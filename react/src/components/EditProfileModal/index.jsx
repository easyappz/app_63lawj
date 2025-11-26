import React, { useState } from 'react';
import { updateProfile } from '../../api/profile';
import './EditProfileModal.css';

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Биография не должна превышать 500 символов';
    }

    if (formData.avatar_url && formData.avatar_url.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.avatar_url)) {
        newErrors.avatar_url = 'Введите корректный URL (начинается с http:// или https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      const dataToSend = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        bio: formData.bio.trim(),
        avatar_url: formData.avatar_url.trim()
      };

      const updatedProfile = await updateProfile(dataToSend);
      onUpdate(updatedProfile);
    } catch (err) {
      console.error('Failed to update profile:', err);
      
      if (err.response && err.response.data) {
        const serverErrors = {};
        Object.keys(err.response.data).forEach(key => {
          if (Array.isArray(err.response.data[key])) {
            serverErrors[key] = err.response.data[key][0];
          } else {
            serverErrors[key] = err.response.data[key];
          }
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: 'Не удалось обновить профиль. Попробуйте позже.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      data-easytag="id7-src/components/EditProfileModal/index.jsx"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Редактировать профиль</h2>
          <button 
            className="modal-close-button" 
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.general && (
              <div className="modal-error-general">
                {errors.general}
              </div>
            )}

            <div className="modal-form-group">
              <label htmlFor="first_name" className="modal-label">
                Имя
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className={`modal-input ${errors.first_name ? 'modal-input-error' : ''}`}
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Введите имя"
              />
              {errors.first_name && (
                <div className="modal-error">{errors.first_name}</div>
              )}
            </div>

            <div className="modal-form-group">
              <label htmlFor="last_name" className="modal-label">
                Фамилия
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className={`modal-input ${errors.last_name ? 'modal-input-error' : ''}`}
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Введите фамилию"
              />
              {errors.last_name && (
                <div className="modal-error">{errors.last_name}</div>
              )}
            </div>

            <div className="modal-form-group">
              <label htmlFor="bio" className="modal-label">
                Биография
                <span className="modal-char-count">
                  {formData.bio.length}/500
                </span>
              </label>
              <textarea
                id="bio"
                name="bio"
                className={`modal-textarea ${errors.bio ? 'modal-input-error' : ''}`}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Расскажите о себе"
                rows="4"
              />
              {errors.bio && (
                <div className="modal-error">{errors.bio}</div>
              )}
            </div>

            <div className="modal-form-group">
              <label htmlFor="avatar_url" className="modal-label">
                URL аватара
              </label>
              <input
                type="text"
                id="avatar_url"
                name="avatar_url"
                className={`modal-input ${errors.avatar_url ? 'modal-input-error' : ''}`}
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatar_url && (
                <div className="modal-error">{errors.avatar_url}</div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-button modal-button-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="modal-button modal-button-submit"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
