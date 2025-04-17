import React from 'react';
import './About.css';
export default function About() {
  return (
    <section id="about">
      <div className="text-content">
        <h1 className="first">Втілюємо ваше бачення</h1>
        <h1 className="second">В реальність</h1>
        <p>
          У BLACKMARK ми віримо, що кожне татуювання розповідає історію. <br />
          Наші художники прагнуть перетворити ваші ідеї на приголомшливі <br />
          витвори мистецтва, які ви будете носити з гордістю все життя.
        </p>
        <div className="container">
          <div className="info">
            <h2 className="second">15+</h2>
            <p>Найкращих майстрів</p>
          </div>
          <div className="info">
            <h2 className="second">10k+</h2>
            <p>Задоволених клієнтів</p>
          </div>
        </div>
      </div>
      <img src="/images/aboutphoto.png" alt="tatoo" />
    </section>
  );
}
