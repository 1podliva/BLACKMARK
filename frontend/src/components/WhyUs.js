import React from 'react'
import './WhyUs.css'

export default function WhyUs() {
  const items = [
    {
      title: 'Ми найкращі',
      text: 'Наші майстри мають величезний досвід і власний стиль.',
      image: '/images/1.svg',
    },
    {
      title: 'Безпечність',
      text: 'Ми використовуємо стерильні інструменти та сертифіковані фарби.',
      image: '/images/2.svg',
    },
    {
      title: 'Індивідуальний підхід',
      text: 'Кожен ескіз створюється під тебе, з урахуванням твоїх ідей.',
      image: '/images/3.svg',
    },
    {
      title: 'Сучасна студія',
      text: 'Комфортне середовище, новітнє обладнання та приємна атмосфера.',
      image: '/images/4.svg',
    },
  ];

  return (
    <section className="whyus-section">
      <div className="whyus-row">
        {items.map(item => (
          <div className="whyus-card" key={item.id}>
            <img src={item.image} alt={item.title} className="whyus-image" />
            <h3 className="whyus-title">{item.title}</h3>
            <p className="whyus-text">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
