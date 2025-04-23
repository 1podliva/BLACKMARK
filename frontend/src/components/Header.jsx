import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <>
      <img src="/images/Banner.svg" id="banner" alt="Banner" />
      <nav className="navbar">
        <h1 className="logo">BLACKMARK</h1>

        {/* Центральні лінки */}
        <div className="nav-links-container">
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={getActiveClass('/')}
              >
                Головна
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={getActiveClass('/about')}
              >
                Про нас
              </Link>
            </li>
            <li>
              <Link
                to="/gallery"
                className={getActiveClass('/gallery')}
              >
                Галерея
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className={getActiveClass('/blog')}
              >
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
            {localStorage.getItem('token') && (
              <li>
                <Link
                  to="/admin"
                  className={getActiveClass('/admin')}
                >
                  Адмін
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Профіль */}
        <div className="profile">
          <Link
            to="/profile"
            className={getActiveClass('/profile')}
          >
            Профіль
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;