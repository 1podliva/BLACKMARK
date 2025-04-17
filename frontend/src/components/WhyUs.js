import React from 'react'
import './WhyUs.css'

export default function WhyUs() {
  const items = [
    { id: 1, title: 'Ми найкращі', text: 'Наші майстри мають величезний досвід і власний стиль.' },
    { id: 2, title: 'Безпечність', text: 'Ми використовуємо стерильні інструменти та сертифіковані фарби.' },
    { id: 3, title: 'Індивідуальний підхід', text: 'Кожен ескіз створюється під тебе, з урахуванням твоїх ідей.' },
    { id: 4, title: 'Сучасна студія', text: 'Комфортне середовище, новітнє обладнання та приємна атмосфера.' },
  ];

  return (
    <section className="whyus-section">
      <div className="whyus-row">
        {items.map(item => (
          <div className="whyus-card" key={item.id}>
            <h2 className="whyus-number">{item.id}</h2>
            <h3 className="whyus-title">{item.title}</h3>
            <p className="whyus-text">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
