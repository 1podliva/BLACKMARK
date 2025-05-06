import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Main.css';

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.scrollTo === 'contacts') {
      setTimeout(() => {
        const contactsSection = document.getElementById('contacts');
        if (contactsSection) {
          contactsSection.scrollIntoView({ behavior: 'smooth' });
          navigate(location.pathname, { replace: true, state: {} });
        }
      }, 200);
    }
  }, [location, navigate]);

  const handleScrollToConsultation = () => {
    const consultationSection = document.getElementById('consultation');
    if (consultationSection) {
      consultationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToGallery = () => {
    const gallerySection = document.getElementById('hp-gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home">
      <div className="home-content">
        <div className="left-side">
          <h1 className="first">Історія твого тіла</h1>
          <h1 className="second">починається тут.</h1>
          <p>
            Відчуйте мистецтво татуювань у BLACKMARK, де кожен виріб <br />
            розповідає унікальну історію.
          </p>
          <div className="actions">
  <button className="button-link" onClick={handleScrollToConsultation}>
    Забронювати сеанс
    <img src="images/buttonvector1.svg" alt="icon" className="button-icon" />
  </button>
  <button className="link-text" onClick={handleScrollToGallery}>
    Наші роботи
  </button>
</div>
        </div>
        <div className="right-side">
          <img src="images/gallery/mainphoto.jpg" alt="Tattoo" className="main-image" />
        </div>
      </div>
    </section>
  );
};

export default Main;