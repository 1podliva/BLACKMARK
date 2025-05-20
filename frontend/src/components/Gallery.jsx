import React, { useState, useEffect } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState(['Усі']);
  const [activeCategory, setActiveCategory] = useState('Усі');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gallery');
        if (!res.ok) throw new Error('Failed to fetch gallery images');
        const data = await res.json();
        console.log('Gallery images:', data);
        setImages(data);
      } catch (err) {
        setError(err.message);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gallery-categories');
        if (!res.ok) throw new Error('Failed to fetch gallery categories');
        const data = await res.json();
        console.log('Gallery categories:', data);
        setCategories(['Усі', ...data.map(cat => cat.name)]);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchImages();
    fetchCategories();
  }, []);

  const filteredImages = images.filter(img => {
    const styles = Array.isArray(img.styles) ? img.styles.map(s => s.trim()) : (img.style ? [img.style.trim()] : []);
    console.log(`Filtering image: ${img.title}, styles: ${styles}, activeCategory: ${activeCategory}`);
    return activeCategory === 'Усі' || styles.includes(activeCategory.trim());
  });

  return (
    <div className="gallery">
      <section className="gallery-header">
        <div className="gallery-content">
          <h2 className="section-subtitle">Наші роботи</h2>
          <h1 className="main-title">
            <span className="first-line">Мистецтво</span>
            <span className="second-line">На твоїй шкірі</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Ознайомтеся з нашою колекцією унікальних татуювань, створених з душею.
          </p>
        </div>
      </section>

      <div className="gallery-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`gallery-tab-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}
      {filteredImages.length === 0 && activeCategory !== 'All' && (
        <p className="no-images">Немає зображень у категорії "{activeCategory}"</p>
      )}

      <div className="gallery-fullwidth">
        <div className="gallery-grid">
          {filteredImages.map(img => (
            <div key={img._id} className="gallery-item">
              <img src={`http://localhost:5000${img.src}`} alt={img.alt} className="gallery-image" />
              <div className="gallery-info">
                <h3>{img.title}</h3>
                <p>{img.description}</p>
                <p><strong>Категорії:</strong> {(img.styles?.length ? img.styles : [img.style]).filter(Boolean).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;