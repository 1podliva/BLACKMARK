import React from 'react';
import './HomeGalleryPreview.css';

const images = [
  {
    src: '/images/gallery/tattoo1.png',
    alt: 'Татуювання 1',
    title: 'Вічна краса троянди',
    description: 'Символ елегантності та сили. Ідеально для витонченого вигляду руки.'
  },
  {
    src: '/images/gallery/tattoo2.png',
    alt: 'Татуювання 2',
    title: 'Традиції Японії на твоїй шкірі',
    description: 'Котики — символ удачі. Покриває всю спину, виглядає вражаюче.'
  },
  {
    src: '/images/gallery/tattoo3.jpg',
    alt: 'Татуювання 3',
    title: 'Сила та честь лицаря',
    description: 'Потужне татуювання на біцепсі. Підкреслює мужність та характер.'
  },
  {
    src: '/images/gallery/tattoo4.jpg',
    alt: 'Татуювання 4',
    title: 'Мистецтво на твоїй шкірі',
    description: 'Майстер творить з ескізу справжнє мистецтво прямо на тілі.'
  },
];

export default function HomeGalleryPreview() {
  return (
    <section className="hp-gallery-section" id="hp-gallery">
      <div className="hp-gallery-container">
        <div className="hp-gallery-header">
          <span className="hp-gallery-subtitle">Наші роботи</span>
          <h2 className="hp-gallery-title">
            <span className="hp-gallery-title-line">Мистецтво</span>
            <span className="hp-gallery-title-accent">На твоїй шкірі</span>
          </h2>
          <div className="hp-gallery-divider"></div>
        </div>

        <div className="hp-gallery-grid">
          {images.map((img, index) => (
            <div className="hp-gallery-card" key={index}>
              <div className="hp-gallery-card-image">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  loading="lazy"
                  className="hp-gallery-img"
                />
                <div className="hp-gallery-card-overlay"></div>
              </div>
              <div className="hp-gallery-card-content">
                <h3 className="hp-gallery-card-title">{img.title}</h3>
                <p className="hp-gallery-card-description">{img.description}</p>
                <div className="hp-gallery-card-divider"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="hp-gallery-cta">
          <a href="/gallery" className="hp-gallery-cta-btn">
            Переглянути галерею
            <span className="hp-gallery-btn-arrow"></span>
          </a>
        </div>
      </div>
    </section>
  );
}