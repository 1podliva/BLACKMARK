import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogIntro.css';

const BlogIntro = () => {
  const navigate = useNavigate();

  const goToBlogPage = () => {
    navigate('/blog');
  };

  return (
    <section className="blog-intro-section" id="blog-intro">
      <div className="blog-intro-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Наш блог</h2>
          <h1 className="main-title">
            <span className="first-line">Історії</span>
            <span className="second-line">Про мистецтво</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Дізнайтесь більше про татуювання, наші техніки та історії клієнтів у нашому блозі.
          </p>
        </div>

        <div className="blog-text-block">
          <p className="blog-description">
            Від порад щодо догляду за татуюваннями до розповідей про створення унікальних дизайнів — наш блог надихає та інформує.
          </p>
          <button className="blog-btn" onClick={goToBlogPage}>
            Перейти до блогу
          </button>
        </div>
      </div>

      <div className="background-macbook-container">
        <img
          src="/images/macbook-blog.png"
          alt="MacBook with blog"
          className="macbook-image"
        />
      </div>
    </section>
  );
};

export default BlogIntro;