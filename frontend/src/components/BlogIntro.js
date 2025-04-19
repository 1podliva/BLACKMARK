import React from 'react';
import './BlogIntro.css';

const BlogIntro = () => {
  return (
    <section id="blog" className="blog-intro-section">
      <h2>Наш блог</h2>
      <p>
        У нашому блозі ви знайдете цікаві статті про татуювання, їх історію, популярні тренди,
        догляд за татуюванням та інші важливі теми, що допоможуть вам краще зрозуміти світ
        татуювань.
      </p>
      <a href="/blog" className="button-link">Читати блог</a>
    </section>
  );
};

export default BlogIntro;
