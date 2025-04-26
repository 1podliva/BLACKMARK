import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleExitAdmin = () => {
    navigate('/');
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Адмін</h2>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${activeSection === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveSection('posts')}
        >
          <span className="sidebar-icon">📝</span>
          Пости
        </button>
        <button
          className={`sidebar-item ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <span className="sidebar-icon">🏷️</span>
          Категорії
        </button>
        <button
          className={`sidebar-item ${activeSection === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveSection('gallery')}
        >
          <span className="sidebar-icon">🖼️</span>
          Галерея
        </button>
        <button className="sidebar-item logout" onClick={handleExitAdmin}>
          <span className="sidebar-icon">🚪</span>
          Вийти з адмін-панелі
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;