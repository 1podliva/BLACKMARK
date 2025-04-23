import React from 'react';
import './Gallery.css';

const Gallery = () => {
  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Наша галерея</h2>
          <h1 className="main-title">
            <span className="first-line">Мистецтво</span>
            <span className="second-line">На шкірі</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Перегляньте наші найкращі роботи, створені з пристрастю та майстерністю.
          </p>
        </div>

        <div className="gallery-grid">
          {/* Placeholder for gallery items */}
          <div className="gallery-item">Тату 1</div>
          <div className="gallery-item">Тату 2</div>
          <div className="gallery-item">Тату 3</div>
          <div className="gallery-item">Тату 4</div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;