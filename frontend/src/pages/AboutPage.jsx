import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <section className="about-section">
      <div className="about-hero">
        <h1 className="hero-title">Про Нас</h1>
        <p className="hero-subtitle">Дізнайтесь про нашу історію, майстрів та пристрасть до досконалості</p>
        <div className="hero-overlay"></div>
        <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="var(--navy-gray)" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,122.7C672,107,768,117,864,133.3C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="about-content">
        <section className="history-section">
          <h2 className="section-title">Наша Історія</h2>
          <div className="timeline">
            <div className="timeline-item">
              <h3>2015</h3>
              <p>Заснування компанії з мрією створювати унікальні вироби.</p>
            </div>
            <div className="timeline-item">
              <h3>2018</h3>
              <p>Розширення команди та запуск першого міжнародного проєкту.</p>
            </div>
            <div className="timeline-item">
              <h3>2023</h3>
              <p>Відкриття нової студії та нагорода за інновації в дизайні.</p>
            </div>
          </div>
        </section>

        <section className="masters-section">
          <h2 className="section-title">Наші Майстри</h2>
          <div className="masters-grid">
            <div className="master-card">
              <img src="https://via.placeholder.com/300x400" alt="Master 1" className="master-image" />
              <h3>Олександр Іванов</h3>
              <p>Експерт з дерев’яних виробів, 10 років досвіду.</p>
            </div>
            <div className="master-card">
              <img src="https://via.placeholder.com/300x400" alt="Master 2" className="master-image" />
              <h3>Марія Петрова</h3>
              <p>Спеціаліст з текстильного дизайну, 8 років майстерності.</p>
            </div>
            <div className="master-card">
              <img src="https://via.placeholder.com/300x400" alt="Master 3" className="master-image" />
              <h3>Ігор Сидоров</h3>
              <p>Майстер металевих конструкцій, 12 років стажу.</p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2 className="section-title">Наші Цінності</h2>
          <div className="values-grid">
            <div className="value-card">
              <i className="fas fa-leaf"></i>
              <h3>Екологічність</h3>
              <p>Використовуємо лише природні матеріали.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-hands-helping"></i>
              <h3>Співпраця</h3>
              <p>Працюємо разом для кращих результатів.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-star"></i>
              <h3>Якість</h3>
              <p>Кожен виріб — шедевр.</p>
            </div>
          </div>
        </section>

        <footer className="about-footer">
          <p>Приєднуйтесь до нас у подорожі до досконалості!</p>
          <button className="contact-btn">Зв’язатися</button>
        </footer>
      </div>
    </section>
  );
};

export default AboutPage;