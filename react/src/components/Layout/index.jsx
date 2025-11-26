import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="layout" data-easytag="id1-react/src/components/Layout/index.jsx">
      <header className="layout-header">
        <div className="layout-header-content">
          <Link to="/" className="layout-logo">
            МиниФейс
          </Link>
          <nav className="layout-nav">
            <Link to="/" className="layout-nav-link">
              Лента
            </Link>
            {user && (
              <Link to={`/profile/${user.id}`} className="layout-nav-link">
                Мой профиль
              </Link>
            )}
          </nav>
          <div className="layout-actions">
            {user && (
              <button onClick={handleLogout} className="layout-logout-btn">
                Выйти
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
