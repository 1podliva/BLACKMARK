import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [activeLink, setActiveLink] = useState('home');

  const handleClick = (link) => {
    setActiveLink(link);
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
              <a
                href="#home"
                className={activeLink === 'home' ? 'active' : ''}
                onClick={() => handleClick('home')}
              >
                Головна
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeLink === 'about' ? 'active' : ''}
                onClick={() => handleClick('about')}
              >
                Про нас
              </a>
            </li>
            <li>
              <a
                href="#gallery"
                className={activeLink === 'gallery' ? 'active' : ''}
                onClick={() => handleClick('gallery')}
              >
                Галерея
              </a>
            </li>
            <li>
              <a
                href="#masters"
                className={activeLink === 'masters' ? 'active' : ''}
                onClick={() => handleClick('masters')}
              >
                Майстри
              </a>
            </li>
            <li>
              <a
                href="#contacts"
                className={activeLink === 'contacts' ? 'active' : ''}
                onClick={() => handleClick('contacts')}
              >
                Контакти
              </a>
            </li>
          </ul>
        </div>

        {/* Профіль */}
        <div className="profile">
          <a
            href="#profile"
            className={activeLink === 'profile' ? 'active' : ''}
            onClick={() => handleClick('profile')}
          >
            Профіль
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
