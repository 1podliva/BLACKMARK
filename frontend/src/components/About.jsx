import React from 'react';
import './About.css';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const goToAboutPage = () => {
    navigate('/about');
  };

  return (
    <section id="about">
      <div className="text-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Чому саме ми?</h2>
          <h1 className="main-title">
            <span className="first-line">Втілюємо ваше бачення</span>
            <span className="second-line">В реальність</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            BLACKMARK - це не просто студія татуювань. Це простір, де ваша ідея 
            перетворюється на мистецтво за допомогою:
          </p>
        </div>

        <div className="features">
          <div className="feature-item">
            <h3>Індивідуальний підхід</h3>
            <p>Кожен ескіз створюється з нуля з урахуванням ваших побажань</p>
          </div>
          <div className="feature-item">
            <h3>Майстерність</h3>
            <p>15+ професійних художників з міжнародним досвідом</p>
          </div>
          <div className="feature-item">
            <h3>Безпека</h3>
            <p>Використання стерильних інструментів та якісних пігментів</p>
          </div>
          <div className="feature-item">
            <h3>Сучасність</h3>
            <p>Комфортне середовище, новітнє обладнання та приємна атмосфера</p>
          </div>
        </div>

        <div className="cta-block">
          <p className="cta-text">
            Наші роботи - це не просто татуювання, а розповіді, втілені в шкіру. 
            Ми створюємо твої історії, які ти будеш носити з собою все життя.
          </p>
          <button className="about-btn" onClick={goToAboutPage}>
            Дізнатися більше про нашу студію
          </button>
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <h2>15+</h2>
            <p>Професійних майстрів</p>
          </div>
          <div className="stat-item">
            <h2>10k+</h2>
            <p>Щасливих клієнтів</p>
          </div>
          <div className="stat-item">
            <h2>100%</h2>
            <p>Гігієна та безпека</p>
          </div>
        </div>
      </div>
    </section>
  );
}