import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaImage, FaCalendar, FaBell, FaUser, FaCalendarAlt } from 'react-icons/fa';

const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const handleExitAdmin = () => {
    localStorage.removeItem('token');
    setSidebarOpen(false);
    navigate('/');
  };

  const menuItems = [
    { id: 'notifications', label: 'Сповіщення', icon: <FaBell className="sidebar-icon" /> },
    { id: 'gallery', label: 'Галерея', icon: <FaImage className="sidebar-icon" /> },
    { id: 'posts', label: 'Пости', icon: <FaImage className="sidebar-icon" /> },
    { id: 'bookings', label: 'Бронювання', icon: <FaCalendar className="sidebar-icon" /> },
    { id: 'artists', label: 'Майстри', icon: <FaUser className="sidebar-icon" /> },
    { id: 'schedules', label: 'Графіки', icon: <FaCalendarAlt className="sidebar-icon" /> },
  ];

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Адмін Панель</h2>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(item.id);
              setSidebarOpen(false);
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <button className="sidebar-item logout" onClick={handleExitAdmin}>
          <FaSignOutAlt className="sidebar-icon" /> Вийти з адмін-панелі
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;