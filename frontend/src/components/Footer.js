import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer">
        <div className="footer-column">
          <h3>BLACKMARK</h3>
          <p>Залиш слід. Залиш враження.</p>
        </div>
        <div className="footer-column">
          <h3>Швидкі посилання</h3>
          <a href="#home">Головна</a>
          <a href="#about">Про нас</a>
          <a href="#gallery">Галерея</a>
          <a href="#masters">Майстри</a>
          <a href="#contacts">Контакти</a>
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
        <p>© 2025 BLACKMARK. Всі права захищені.</p>
      </div>
    </footer>
  );
}
