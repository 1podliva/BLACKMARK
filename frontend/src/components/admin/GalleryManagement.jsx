import React, { useState, useEffect } from 'react';
import './GalleryManagement.css';

const GalleryManagement = ({ galleryImages, setGalleryImages, handleSubmit, setError, setSuccess, fetchGalleryImages, galleryCategories }) => {
  const [imageForm, setImageForm] = useState({
    id: '',
    alt: '',
    title: '',
    description: '',
    styles: [],
    image: null,
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [activeStyle, setActiveStyle] = useState('All');

  useEffect(() => {
    console.log('Gallery images:', galleryImages);
    console.log('Gallery categories:', galleryCategories);
  }, [galleryImages, galleryCategories]);

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!imageForm.styles.length) {
      setError('Будь ласка, виберіть принаймні одну категорію');
      return;
    }
    const formData = new FormData();
    formData.append('alt', imageForm.alt);
    formData.append('title', imageForm.title);
    formData.append('description', imageForm.description);
    imageForm.styles.forEach(style => {
      formData.append('styles', style);
      console.log('Appending style:', style);
    });
    if (imageForm.image) formData.append('image', imageForm.image);
    if (imageForm.id && imageForm.imageUrl && !imageForm.image) formData.append('image', imageForm.imageUrl);
    console.log('FormData entries:', Array.from(formData.entries()));
    try {
      const url = imageForm.id ? `http://localhost:5000/api/gallery/${imageForm.id}` : 'http://localhost:5000/api/gallery';
      const method = imageForm.id ? 'PUT' : 'POST';
      const data = await handleSubmit(url, method, formData, true);
      setSuccess(imageForm.id ? 'Зображення оновлено!' : 'Зображення додано!');
      setImageForm({ id: '', alt: '', title: '', description: '', styles: [], image: null, imageUrl: '' });
      setImagePreview('');
      fetchGalleryImages();
    } catch (err) {
      // Error set by handleSubmit
    }
  };

  const handleImageEdit = (image) => {
    const imageStyles = image.styles?.length ? image.styles : [image.style].filter(Boolean);
    setImageForm({
      id: image._id,
      alt: image.alt,
      title: image.title,
      description: image.description,
      styles: imageStyles,
      image: null,
      imageUrl: image.src,
    });
    setImagePreview(image.src ? `http://localhost:5000${image.src}` : '');
  };

  const handleImageDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це зображення?')) return;
    console.log('Deleting image ID:', id);
    try {
      const res = await handleSubmit(`http://localhost:5000/api/gallery/${id}`, 'DELETE');
      console.log('Delete response:', res);
      setSuccess('Зображення видалено!');
      fetchGalleryImages();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Не вдалося видалити зображення: ' + err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageForm({ ...imageForm, image: file });
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(imageForm.imageUrl ? `http://localhost:5000${imageForm.imageUrl}` : '');
    }
  };

  const handleImageClear = () => {
    setImageForm({ ...imageForm, image: null, imageUrl: '' });
    setImagePreview('');
  };

  const handleStylesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    console.log('Selected styles:', selected);
    setImageForm({ ...imageForm, styles: selected });
  };

  return (
    <div className="gallery-management">
      <h3>Керування галереєю</h3>
      <form className="admin-form" onSubmit={handleImageSubmit}>
        <div className="form-group">
          <label>Зображення</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required={!imageForm.id} />
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button type="button" className="image-clear-btn" onClick={handleImageClear}>
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Заголовок</label>
          <input
            type="text"
            value={imageForm.title}
            onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
            placeholder="Введіть заголовок"
            required
          />
        </div>
        <div className="form-group">
          <label>Опис</label>
          <input
            type="text"
            value={imageForm.description}
            onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
            placeholder="Введіть опис"
            required
          />
        </div>
        <div className="form-group">
          <label>Категорії (утримуйте Ctrl для вибору кількох)</label>
          {galleryCategories && galleryCategories.length > 0 ? (
            <select multiple value={imageForm.styles} onChange={handleStylesChange} required>
              {galleryCategories.map(category => (
                <option key={category._id} value={category.name}>{category.name}</option>
              ))}
            </select>
          ) : (
            <p>Категорії не завантажено</p>
          )}
        </div>
        <div className="form-group">
          <label>Alt текст</label>
          <input
            type="text"
            value={imageForm.alt}
            onChange={(e) => setImageForm({ ...imageForm, alt: e.target.value })}
            placeholder="Введіть alt текст"
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          {imageForm.id ? 'Оновити зображення' : 'Додати зображення'}
        </button>
      </form>

      <div className="gallery-tabs">
        {['All', ...(galleryCategories || []).map(cat => cat.name)].map(style => (
          <button
            key={style}
            className={`gallery-tab-btn ${activeStyle === style ? 'active' : ''}`}
            onClick={() => setActiveStyle(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="gallery-list">
        {galleryImages
          .filter(img => activeStyle === 'All' || (img.styles || [img.style]).includes(activeStyle))
          .map(img => {
            console.log('Rendering image:', img);
            return (
              <div key={img._id} className="gallery-item-admin">
                <img src={`http://localhost:5000${img.src}`} alt={img.alt} className="gallery-item-image" />
                <div className="gallery-item-info">
                  <h3>{img.title}</h3>
                  <p>{img.description}</p>
                  <p><strong>Категорії:</strong> {(img.styles?.length ? img.styles : [img.style]).filter(Boolean).join(', ')}</p>
                  <div className="gallery-item-actions">
                    <button className="edit-btn" onClick={() => handleImageEdit(img)}>Редагувати</button>
                    <button className="delete-btn" onClick={() => handleImageDelete(img._id)}>Видалити</button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default GalleryManagement;