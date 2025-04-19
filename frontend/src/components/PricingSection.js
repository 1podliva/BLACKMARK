import React from 'react';
import './PricingSection.css';

const pricingData = [
  {
    title: 'Тату на руці',
    price: 'Від 1500 грн',
    description: 'Оберіть стиль для виразного і сміливого вигляду.'
  },
  {
    title: 'Тату на спині',
    price: 'Від 3000 грн',
    description: 'Гарно підходить для великих композицій.'
  },
  {
    title: 'Міні-тату',
    price: 'Від 800 грн',
    description: 'Для тих, хто любить мінімалізм.'
  },
  {
    title: 'Тату на грудях',
    price: 'Від 2000 грн',
    description: 'Додайте глибину своєму образу з тату на грудях.'
  },
  {
    title: 'Тату на шиї',
    price: 'Від 1000 грн',
    description: 'Незабутнє татуювання, яке притягує погляди.'
  },
];

export default function PricingSection() {
  return (
    <div className="pricing-section">
      <h2>Наші Розцінки</h2>
      <p>Обирайте стиль, який підходить саме вам. Кожне татуювання — це мистецтво.</p>
      <div className="pricing-grid">
        {pricingData.map((item, index) => (
          <div className="pricing-item" key={index}>
            <div className="pricing-content">
              <h3>{item.title}</h3>
              <p className="price">{item.price}</p>
              <p className="description">{item.description}</p>
              <a href="#!" className="btn-book">Записатися</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
