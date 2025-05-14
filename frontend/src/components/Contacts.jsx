import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import './Contacts.css';

// Component to handle map re-rendering and marker debugging
const MapEffect = ({ markerPosition }) => {
  const map = useMap();

  useEffect(() => {
    console.log('Marker position:', markerPosition);
    map.invalidateSize();
    map.flyTo(markerPosition, 15, { duration: 1 });
  }, [map, markerPosition]);

  return null;
};

const Contacts = () => {
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
      name: e.target[0].value,
      email: e.target[1].value,
      message: e.target[2].value,
    };

    try {
      const response = await fetch('http://localhost:5000/api/notifications/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }

      toast.success('Повідомлення успішно відправлено!');
      e.target.reset(); // Clear the form after successful submission
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Не вдалося відправити повідомлення. Спробуйте ще раз.');
    }
  };

  const center = [49.8097432, 24.0765274];
  const markerPosition = [49.8097432, 24.0765274];

  const customIcon = L.icon({
    iconUrl: '/images/gps.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    iconRetinaUrl: '/images/gps.svg',
    shadowUrl: null,
  });

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
                <p>м. Львів, вул. Миколи Пимоненка, 17</p>
              </div>
            </div>
          </div>

          <div className="contacts-map">
            <MapContainer
              center={center}
              zoom={15}
              style={{ width: '100%', height: '100%', minHeight: '300px' }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                subdomains="abcd"
                maxZoom={19}
              />
              <Marker position={markerPosition} icon={customIcon} />
              <MapEffect markerPosition={markerPosition} />
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;