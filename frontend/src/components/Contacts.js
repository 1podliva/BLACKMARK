import React, { useState } from 'react';
import './Contacts.css';

const Contacts = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section className="contacts-section" id="contacts">
      <div className="contacts-header">
        <h2>Контакти</h2>
        <p>Зв’яжіться з нами з будь-якого питання</p>
      </div>

      <div className="contacts-main-container">
        <div className="custom-layout">
          <div className="contact-form-container">
            <h3>Напишіть нам</h3>
            <form className="contact-form" onSubmit={handleFormSubmit}>
              <input type="text" placeholder="Ваше ім’я" required />
              <input type="email" placeholder="Ваш Email" required />
              <textarea placeholder="Ваше повідомлення" required></textarea>
              <button type="submit">Відправити</button>
              {formSubmitted && <p className="form-success">Повідомлення відправлено!</p>}
            </form>
          </div>

          <div className="contact-info-container compact">
            <div className="contact-info">
              <img src="/images/phone.svg" className="contact-icon" alt="Phone" />
              <h3>Телефон</h3>
              <p><a href="tel:+380999999999">+38 (099) 999 99 99</a></p>
            </div>
            <div className="contact-info">
              <img src="/images/email.svg" className="contact-icon" alt="Email" />
              <h3>Email</h3>
              <p><a href="mailto:tattoo@studio.com">tattoo@studio.com</a></p>
            </div>
            <div className="contact-info">
              <img src="/images/location.svg" className="contact-icon" alt="Location" />
              <h3>Адреса</h3>
              <p>м. Київ, вул. Пишна 13</p>
            </div>
          </div>
          <div className="contacts-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18..."
            title="Studio Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
        </div>

        
      </div>
    </section>
  );
};

export default Contacts;
