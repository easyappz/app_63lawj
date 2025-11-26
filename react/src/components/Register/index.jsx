import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Ошибка регистрации. Попробуйте снова.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" data-easytag="id1-react/src/components/Register/index.jsx">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-logo">МиниФейс</h1>
          <p className="register-subtitle">Создайте новый аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.general && <div className="register-error">{errors.general}</div>}

          <div className="register-field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="register-input"
            />
            {errors.email && <span className="register-field-error">{errors.email[0]}</span>}
          </div>

          <div className="register-field">
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={150}
              className="register-input"
            />
            {errors.username && <span className="register-field-error">{errors.username[0]}</span>}
          </div>

          <div className="register-field">
            <input
              type="text"
              name="first_name"
              placeholder="Имя"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="register-input"
            />
            {errors.first_name && <span className="register-field-error">{errors.first_name[0]}</span>}
          </div>

          <div className="register-field">
            <input
              type="text"
              name="last_name"
              placeholder="Фамилия"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="register-input"
            />
            {errors.last_name && <span className="register-field-error">{errors.last_name[0]}</span>}
          </div>

          <div className="register-field">
            <input
              type="password"
              name="password"
              placeholder="Пароль (минимум 8 символов)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="register-input"
            />
            {errors.password && <span className="register-field-error">{errors.password[0]}</span>}
          </div>

          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="register-footer">
            <span>Уже есть аккаунт?</span>
            <Link to="/login" className="register-link">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
