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
      <div className="contacts-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Зв’яжіться з нами</h2>
          <h1 className="main-title">
            <span className="first-line">Ваші ідеї</span>
            <span className="second-line">Наші контакти</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Маєте питання чи хочете записатися? Напишіть нам або зателефонуйте!
          </p>
        </div>

        <div className="contacts-grid">
          <div className="form-info-block">
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

            <div className="contact-info-container">
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
          </div>

          <div className="contacts-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.513880439279!2d24.070372079543187!3d49.80916605797731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473ae81c20a2ca41%3A0x29e04fd364c34bda!2sTechnical%20College!5e0!3m2!1sru!2sua!4v1745317070931!5m2!1sru!2sua"
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