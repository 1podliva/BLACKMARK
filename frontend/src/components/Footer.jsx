import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();

  const handleContactsClick = (e) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
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

  return (
    <footer className="footer-wrapper">
      <div className="footer">
        <div className="footer-column">
          <h3>BLACKMARK</h3>
          <p>Залиш слід. Залиш враження.</p>
        </div>
        <div className="footer-column">
          <h3>Швидкі посилання</h3>
          <Link to="/">Головна</Link>
          <Link to="/about">Про нас</Link>
          <Link to="/gallery">Галерея</Link>
          <Link to="/blog">Блог</Link>
          <a href="#contacts" onClick={handleContactsClick}>
            Контакти
          </a>
        </div>
        <div className="footer-column">
          <h3>Графік роботи</h3>
          <p>Понеділок – Субота</p>
          <p>10:00 - 20:00</p>
        </div>
        <div className="footer-column">
          <h3>Ми в соцмережах</h3>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <i className="fab fa-instagram"></i> Instagram
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <i className="fab fa-facebook"></i> Facebook
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2025{' '}
          {localStorage.getItem('token') ? (
            <Link to="/admin/" className="footer-admin-link">
              BLACKMARK
            </Link>
          ) : (
            'BLACKMARK'
          )}
          . Всі права захищені.
        </p>
      </div>
    </footer>
  );
}