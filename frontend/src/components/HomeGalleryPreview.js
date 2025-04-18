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
  {
    src: '/images/gallery/tattoo5.jpg',
    alt: 'Татуювання 5',
    title: 'Татуювання, яке привертає увагу',
    description: 'Ефектний малюнок на ключиці. Стильно й жіночно.'
  },
  {
    src: '/images/gallery/tattoo6.jpg',
    alt: 'Татуювання 6',
    title: 'Деталі, що мають значення',
    description: 'Мінімалістичне татуювання на пальці для витонченого стилю.'
  },
  {
    src: '/images/gallery/tattoo7.jpg',
    alt: 'Татуювання 7',
    title: 'Художня робота на руці',
    description: 'Повний рукав — простір для творчості. Яскраво й сміливо.'
  },
];


export default function HomeGalleryPreview() {
  return (
    <div className="home-gallery-preview">
      <h2>Галерея робіт</h2>
      <p>Ознайомтеся з нашою різноманітною колекцією мистецтва татуювань.</p>

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

      <a href="/gallery" className="view-more-btn">Переглянути більше</a>
    </div>
  );
}
