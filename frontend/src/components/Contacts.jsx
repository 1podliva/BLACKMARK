import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Contacts.css';

// Component to handle map re-rendering and marker debugging
const MapEffect = ({ markerPosition }) => {
  const map = useMap();

  useEffect(() => {
    // Log to confirm the marker is being created
    console.log('Marker position:', markerPosition);

    // Force map to re-render by invalidating its size
    map.invalidateSize();

    // Optionally, fly to the marker position to ensure it's visible
    map.flyTo(markerPosition, 15, { duration: 1 });
  }, [map, markerPosition]);

  return null;
};

const Contacts = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  // Center of the map (coordinates for Технічний коледж, Lviv)
  const center = [49.8097432, 24.0765274];

  // Position for the marker (same as the center)
  const markerPosition = [49.8097432, 24.0765274];

  // Create a custom marker icon with a fallback to the default Leaflet icon
  const customIcon = L.icon({
    iconUrl: '/images/gps.svg', // Path to the location icon
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Anchor point (center bottom of the icon)
    popupAnchor: [0, -32], // Popup anchor (if you add a popup later)
    // Fallback to default Leaflet icon if custom icon fails
    iconRetinaUrl: '/images/gps.svg',
    shadowUrl: null, // Disable shadow
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
                {formSubmitted && <p className="form-success">!</p>}
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