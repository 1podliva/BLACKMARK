import React from 'react';
import './HomeGalleryPreview.css';

const images = [
  { src: '/images/gallery/tattoo1.png', alt: 'Татуювання 1' },
  { src: '/images/gallery/tattoo2.png', alt: 'Татуювання 2' },
  { src: '/images/gallery/tattoo3.jpg', alt: 'Татуювання 3' },
];

export default function HomeGalleryPreview() {
  return (
    <div className="home-gallery-preview">
      <h2>Галерея робіт</h2>
      <p>Ознайомтеся з нашою різноманітною колекцією мистецтва татуювань.</p>

      <div className="gallery-preview-grid">
        {images.map((img, index) => (
          <div className="preview-item" key={index}>
            <img src={img.src} alt={img.alt} />
            <div className="preview-info">
              <h3>Назва тату {index + 1}</h3>
              <p>Тип: Реалізм</p>
            </div>
          </div>
        ))}
      </div>

      <a href="/gallery" className="view-more-btn">Переглянути більше</a>
    </div>
  );
}
