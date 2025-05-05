import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const [masters, setMasters] = useState([]);
  const navigate = useNavigate();
  const backendBaseUrl = 'http://localhost:5000'; // Базовий URL вашого бекенду

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/artists');
        if (!res.ok) throw new Error('Не вдалося завантажити майстрів');
        const data = await res.json();
        setMasters(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMasters();
  }, []);

  const handleContactClick = () => {
    navigate('/');
    setTimeout(() => {
      const consultationSection = document.getElementById('consultation');
      if (consultationSection) {
        consultationSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Затримка для забезпечення завантаження сторінки
  };

  return (
    <section className="about-section">
      <div className="about-content">
        <div className="about-intro-block">
          <span className="about-section-subtitle">Наша історія</span>
          <h1 className="about-main-title">
            <span className="about-first-line">Дізнайтесь більше</span>
            <span className="about-second-line">про BLACKMARK</span>
          </h1>
          <div className="about-divider"></div>
          <p className="about-intro-text">
            Ми — студія татуювань, де мистецтво і пристрасть об'єднуються для створення унікальних історій на вашому тілі. Заснована в 2015 році, наша команда прагне до досконалості в кожному штриху.
          </p>
        </div>

        <div className="about-stats-container">
          <div className="about-stat-item">
            <h2>10+</h2>
            <p>Років досвіду</p>
          </div>
          <div className="about-stat-item">
            <h2>50+</h2>
            <p>Майстрів у команді</p>
          </div>
          <div className="about-stat-item">
            <h2>1000+</h2>
            <p>Задоволених клієнтів</p>
          </div>
        </div>

        <section className="about-features">
          <h2 className="section-title">Наш шлях</h2>
          <div className="feature-grid">
            <div className="about-feature-item">
              <h3>2015</h3>
              <p>Початок нашого шляху у світі татуювань із мрією створювати унікальні дизайни.</p>
            </div>
            <div className="about-feature-item">
              <h3>2018</h3>
              <p>Перший міжнародний проєкт та визнання у тату-спільноті.</p>
            </div>
            <div className="about-feature-item">
              <h3>2023</h3>
              <p>Відкриття нової студії та нагорода за інноваційний дизайн.</p>
            </div>
          </div>
        </section>

        <section className="masters-section">
          <h2 className="section-title">Наші Майстри</h2>
          <div className="masters-grid">
            {masters.map((master) => (
              <div key={master._id} className="master-card">
                <img
                  src={
                    master.photo_url
                      ? `${backendBaseUrl}/artists${master.photo_url.replace('/public/artists', '')}`
                      : 'https://placehold.co/300x400?text=Майстер&font=roboto'
                  }
                  alt={master.name}
                  className="master-image"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x400?text=Майстер&font=roboto';
                    console.log('Image load error for:', master.photo_url);
                  }}
                />
                <h3>{master.name}</h3>
                <p>{master.description || 'Опис відсутній'}</p>
                <p>Вік: {master.age || 'Невідомо'}</p>
                <p>Стаж: {master.experience || 'Невідомо'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="values-section">
          <h2 className="section-title">Наші Цінності</h2>
          <div className="values-grid">
            <div className="value-card">
              <i className="fas fa-leaf benefit-icon"></i>
              <h3>Екологічність</h3>
              <p>Лише безпечні та натуральні матеріали для татуювань.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-hands-helping benefit-icon"></i>
              <h3>Співпраця</h3>
              <p>Командна робота для найкращих результатів.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-star benefit-icon"></i>
              <h3>Якість</h3>
              <p>Кожен татуювання — витвір мистецтва.</p>
            </div>
          </div>
        </section>

        <div className="about-cta-block">
          <p className="about-cta-text">Готові до трансформації? Долучайтесь до нас!</p>
          <button className="about-btn" onClick={handleContactClick}>
            Зв’язатися
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;