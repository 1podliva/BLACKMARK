import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Consultation.css';

const Consultation = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <section className="consultation-section" id="consultation">
      <div className="consultation-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Перший крок до татуювання</h2>
          <h1 className="main-title">
            <span className="first-line">Створіть акаунт</span>
            <span className="second-line">Та отримайте більше</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Зареєструйтесь, щоб отримати персональний доступ до всіх можливостей студії:
          </p>
        </div>

        <div className="registration-grid">
          <div className="registration-benefits">
            <div className="benefit-card">
              <div className="benefit-icon">🎨</div>
              <h3>Персональний кабінет</h3>
              <p>Зберігайте улюблені ескізи, історію записів та персональні налаштування</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">⏱️</div>
              <h3>Швидкий запис</h3>
              <p>Записуйтесь на консультацію в 1 клік, без необхідності заповнювати форми</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">💎</div>
              <h3>Ексклюзивні пропозиції</h3>
              <p>Отримуйте спеціальні пропозиції та знижки для зареєстрованих користувачів</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">📅</div>
              <h3>Особистий календар</h3>
              <p>Керуйте своїми записами та отримуйте нагадування про сеанси</p>
            </div>
          </div>

          <div className="registration-cta">
            <div className="cta-card">
              <h3>Почніть зараз!</h3>
              <p>Створіть акаунт та отримайте:</p>
              <ul className="benefits-list">
                <li>✅ Миттєвий запис на консультацію</li>
                <li>✅ Персональні рекомендації</li>
                <li>✅ Історію ваших татуювань</li>
                <li>✅ Ексклюзивні пропозиції</li>
              </ul>
              <button 
                className="cta-button"
                onClick={handleRegisterClick}
              >
                Зареєструватися за 30 секунд
              </button>
              <p className="login-text">
                Вже маєте акаунт? <a href="/login">Увійти</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultation;