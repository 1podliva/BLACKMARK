import React from 'react';
import './Header.css';  

const Header = () => {
  return (
    <nav className="navbar">
      <h1 class="logo">BLACKMARK</h1>
    <ul class="nav-links">
      <li><a href="#home">Головна</a></li>
      <li><a href="#about">Про нас</a></li>
      <li><a href="#gallery">Галерея</a></li>
      <li><a href="#masters">Майстри</a></li>
      <li><a href="#contacts">Контакти</a></li>
      <li class="profile"><a href="#profile">Профіль</a></li>
    </ul>
    </nav>
  );
};

export default Header;
