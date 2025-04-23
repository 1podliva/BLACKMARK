import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <section className="profile-section" id="profile">
      <div className="profile-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Ваш профіль</h2>
          <h1 className="main-title">
            <span className="first-line">Особиста</span>
            <span className="second-line">Зона</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Керуйте своїми записами, переглядайте історію та налаштування.
          </p>
        </div>

        <div className="profile-details">
          <p>Тут буде ваш профіль (налаштування, історія записів, тощо).</p>
        </div>
      </div>
    </section>
  );
};

export default Profile;