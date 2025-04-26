import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext); // Додаємо AuthContext
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Стан для модального вікна

  const handleContactsClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#contacts');
      setTimeout(() => {
        const contactsSection = document.getElementById('contacts');
        if (contactsSection) {
          contactsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const contactsSection = document.getElementById('contacts');
      if (contactsSection) {
        contactsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile'); // Якщо користувач увійшов, переходимо в профіль
    } else {
      setIsAuthModalOpen(true); // Інакше відкриваємо модальне вікно
    }
  };

  return (
    <>
      <img src="/images/Banner.svg" id="banner" alt="Banner" />
      <nav className="navbar">
        <h1 className="logo">BLACKMARK</h1>

        {/* Центральні лінки */}
        <div className="nav-links-container">
          <ul className="nav-links">
            <li>
              <Link to="/" className={getActiveClass('/')}>
                Головна
              </Link>
            </li>
            <li>
              <Link to="/about" className={getActiveClass('/about')}>
                Про нас
              </Link>
            </li>
            <li>
              <Link to="/gallery" className={getActiveClass('/gallery')}>
                Галерея
              </Link>
            </li>
            <li>
              <Link to="/blog" className={getActiveClass('/blog')}>
                Блог
              </Link>
            </li>
            <li>
              <a
                href="#contacts"
                className={location.hash === '#contacts' ? 'active' : ''}
                onClick={handleContactsClick}
              >
                Контакти
              </a>
            </li>
          </ul>
        </div>

        {/* Профіль або Вхід/Реєстрація */}
        <div className="profile">
          <button onClick={handleAuthClick} className={getActiveClass('/profile')}>
            {user ? 'Профіль' : 'Вхід / Реєстрація'}
          </button>
          {user && (
            <button onClick={logout} className="logout-btn">
              Вийти
            </button>
          )}
        </div>

        {/* Модальне вікно для входу/реєстрації */}
        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </nav>
    </>
  );
};

export default Header;