import React from 'react';
import './Main.css';

const Main = () => {
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
            <div className="button">
              <a href="#booking" className="button-link">Забронювати сеанс</a>
              <img src="images/buttonvector1.svg" alt="icon" className="button-icon" />
            </div>
            <a href="#works" className="link-text">Наші роботи</a>
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
