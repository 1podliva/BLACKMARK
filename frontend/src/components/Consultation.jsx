import React, { useState } from 'react';
import './Consultation.css';

const Consultation = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section className="consultation-section" id="consultation">
      <div className="consultation-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Запис на консультацію</h2>
          <h1 className="main-title">
            <span className="first-line">Ваше татуювання</span>
            <span className="second-line">Починається тут</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Розкажіть нам про вашу ідею, і ми допоможемо втілити її в мистецтво на вашій шкірі.
          </p>
        </div>

        <div className="consultation-grid">
          <div className="consultation-form-container">
            <h3>Забронюйте консультацію</h3>
            <form className="consultation-form" onSubmit={handleFormSubmit}>
              <input type="text" placeholder="Ваше ім’я" required />
              <input type="email" placeholder="Ваш Email" required />
              <input type="date" placeholder="Бажана дата" required />
              <textarea placeholder="Опишіть вашу ідею татуювання" required></textarea>
              <button type="submit">Надіслати заявку</button>
              {formSubmitted && <p className="form-success">Заявку відправлено! Ми зв’яжемося з вами незабаром.</p>}
            </form>
          </div>

          <div className="consultation-info">
            <h3>Чому консультація?</h3>
            <p>
              Наші майстри допоможуть вам визначитися з дизайном, розміром та розташуванням татуювання. 
              Ми врахуємо всі ваші побажання, щоб створити щось унікальне.
            </p>
            <p className="contact-snippet">
              Маєте термінове питання? Телефонуйте: <a href="tel:+380999999999">+38 (099) 999 99 99</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultation;