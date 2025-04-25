import React, { useState, useEffect } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [styles, setStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('All');

  // Fetch images from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setFilteredImages(data);
        // Extract unique styles
        const uniqueStyles = ['All', ...new Set(data.map(img => img.style))];
        setStyles(uniqueStyles);
      })
      .catch(err => console.error(err));
  }, []);

  // Filter images by style
  useEffect(() => {
    if (selectedStyle === 'All') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.style === selectedStyle));
    }
  }, [selectedStyle, images]);

  return (
    <section className="gallery-page">
      <div className="gallery-content">
        <h2 className="section-subtitle">Галерея</h2>
        <h1 className="main-title">
          <span className="first-line">Наші</span>
          <span className="second-line">Татуювання</span>
        </h1>
        <div className="divider"></div>
        <p className="intro-text">
          Перегляньте нашу колекцію унікальних татуювань, створених з душею та майстерністю.
        </p>
      </div>

      <div className="gallery-filter">
        {styles.map(style => (
          <button
            key={style}
            className={`filter-btn ${selectedStyle === style ? 'active' : ''}`}
            onClick={() => setSelectedStyle(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredImages.length > 0 ? (
          filteredImages.map((img, index) => (
            <div className={`gallery-item item-${index + 1}`} key={img._id}>
              <img src={img.src} alt={img.alt} />
              <div className="gallery-info">
                <h3>{img.title}</h3>
                <p>{img.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">Немає татуювань у цій категорії.</p>
        )}
      </div>
    </section>
  );
};

export default Gallery;