import React from 'react';
import './HomeGalleryPreview.css';

const images = [
  {
    src: '/images/gallery/tattoo1.png',
    alt: 'Татуювання 1',
    title: 'Вічна краса троянди',
    description: 'Татуювання троянди — символ елегантності та сили. Чудово підходить для тих, хто хоче додати на руці вишуканості та глибини.'
  },
  {
    src: '/images/gallery/tattoo2.png',
    alt: 'Татуювання 2',
    title: 'Традиції Японії на твоїй шкірі',
    description: 'Японські котики вважаються символами удачі та удачливості. Це татуювання — справжнє мистецтво, яке охоплює всю спину, створюючи неповторний вигляд.'
  },
  {
    src: '/images/gallery/tattoo3.jpg',
    alt: 'Татуювання 3',
    title: 'Сила та честь лицаря',
    description: 'Лицар — символ мужності та відваги. Татуювання на біцепсі виглядає потужно і вражаюче, підкреслюючи силу та характер.'
  },
  {
    src: '/images/gallery/tattoo4.jpg',
    alt: 'Татуювання 4',
    title: 'Мистецтво на твоїй шкірі',
    description: 'Татуювання — це процес, що починається з ескізу і перетворюється на справжнє мистецтво. Майстер працює, додаючи кожен штрих, щоб створити ідеальний малюнок.'
  },
  {
    src: '/images/gallery/tattoo5.jpg',
    alt: 'Татуювання 5',
    title: 'Татуювання, яке привертає увагу',
    description: 'Це татуювання на ключиці виглядає ефектно і дуже жіночно. Ідеально підходить для тих, хто хоче виділити цей елемент тіла.'
  },
  {
    src: '/images/gallery/tattoo6.jpg',
    alt: 'Татуювання 6',
    title: 'Деталі, що мають значення',
    description: 'Татуювання на пальці — це маленьке, але дуже виразне мистецтво. Ідеально для тих, хто любить мінімалізм та стиль.'
  },
  {
    src: '/images/gallery/tattoo7.jpg',
    alt: 'Татуювання 7',
    title: 'Справжня художня робота на кожному сантиметрі',
    description: 'Рукав — це величезна площа для творчості. Це татуювання охоплює всю руку і створює неповторний вигляд.'
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
