import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaImage, FaFolder, FaCalendar, FaBell, FaUser, FaCalendarAlt } from 'react-icons/fa';


const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const handleExitAdmin = () => {
    setSidebarOpen(false);
    navigate('/');
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Адмін Панель</h2>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${activeSection === 'notifications' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('notifications');
            setSidebarOpen(false);
          }}
        >
          <FaBell className="sidebar-icon" /> Сповіщення
        </button>
        <button
          className={`sidebar-item ${activeSection === 'gallery' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('gallery');
            setSidebarOpen(false);
          }}
        >
          <FaImage className="sidebar-icon" /> Галерея
        </button>
        <button
          className={`sidebar-item ${activeSection === 'gallery-categories' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('gallery-categories');
            setSidebarOpen(false);
          }}
        >
          <FaFolder className="sidebar-icon" /> Категорії галереї
        </button>
        <button
          className={`sidebar-item ${activeSection === 'posts' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('posts');
            setSidebarOpen(false);
          }}
        >
          <FaImage className="sidebar-icon" /> Пости
        </button>
        <button
          className={`sidebar-item ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('categories');
            setSidebarOpen(false);
          }}
        >
          <FaFolder className="sidebar-icon" /> Категорії постів
        </button>
        <button
          className={`sidebar-item ${activeSection === 'bookings' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('bookings');
            setSidebarOpen(false);
          }}
        >
          <FaCalendar className="sidebar-icon" /> Бронювання
        </button>
        <button
          className={`sidebar-item ${activeSection === 'artists' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('artists');
            setSidebarOpen(false);
          }}
        >
          <FaUser className="sidebar-icon" /> Майстри
        </button>
        <button
          className={`sidebar-item ${activeSection === 'schedules' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('schedules');
            setSidebarOpen(false);
          }}
        >
          <FaCalendarAlt className="sidebar-icon" /> Графіки
        </button>
        <button className="sidebar-item logout" onClick={handleExitAdmin}>
          <FaSignOutAlt className="sidebar-icon" /> Вийти з адмін-панелі
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;