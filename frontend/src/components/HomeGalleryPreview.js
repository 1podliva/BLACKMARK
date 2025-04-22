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
    <section className="home-gallery-preview">
      <div className="gallery-content">
        <h2 className="section-subtitle">Наші роботи</h2>
        <h1 className="main-title">
          <span className="first-line">Мистецтво</span>
          <span className="second-line">На твоїй шкірі</span>
        </h1>
        <div className="divider"></div>
        <p className="intro-text">
          Ознайомтеся з нашою колекцією унікальних татуювань, створених з душею.
        </p>

        <div className="gallery-preview-grid">
          {images.map((img, index) => (
            <div className={`preview-item item-${index + 1}`} key={index}>
              <img src={img.src} alt={img.alt} />
              <div className="preview-info">
                <h3>{img.title}</h3>
                <p>{img.description}</p>
              </div>
            </div>
          ))}
        </div>

        <a href="/gallery" className="gallery-btn">Переглянути більше</a>
      </div>
    </section>
  );
}