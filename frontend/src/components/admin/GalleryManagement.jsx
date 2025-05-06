import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import './GalleryManagement.css';

Modal.setAppElement('#root');

const GalleryManagement = ({ galleryImages, setGalleryImages, handleSubmit, toast, fetchGalleryImages, galleryCategories, mode }) => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevImageRef = useRef(null);

  useEffect(() => {
    console.log('Gallery images:', galleryImages);
    console.log('Gallery categories:', galleryCategories);
    console.log('Mode:', mode);
  }, [galleryImages, galleryCategories, mode]);

  useEffect(() => {
    return () => {
      if (prevImageRef.current) {
        URL.revokeObjectURL(prevImageRef.current);
      }
    };
  }, [imagePreview]);

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageForm.styles.length) {
      toast.error('Будь ласка, виберіть принаймні одну категорію', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    if (!imageForm.title.trim()) {
      toast.error('Заголовок обов’язковий', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    if (!imageForm.description.trim()) {
      toast.error('Опис обов’язковий', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    if (!imageForm.alt.trim()) {
      toast.error('Alt текст обов’язковий', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    if (!imageForm.id && !imageForm.image) {
      toast.error('Зображення обов’язкове для додавання', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('alt', imageForm.alt);
      formData.append('title', imageForm.title);
      formData.append('description', imageForm.description);
      imageForm.styles.forEach((style) => formData.append('styles', style));
      if (imageForm.image) {
        formData.append('image', imageForm.image);
      }

      const url = imageForm.id ? `http://localhost:5000/api/gallery/${imageForm.id}` : 'http://localhost:5000/api/gallery';
      const method = imageForm.id ? 'PUT' : 'POST';
      await handleSubmit(url, method, formData, true);
      toast.success(imageForm.id ? 'Зображення оновлено!' : 'Зображення додано!', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: imageForm.id ? 'update-image-toast' : 'create-image-toast',
      });
      setImageForm({ id: '', alt: '', title: '', description: '', styles: [], image: null, imageUrl: '' });
      setImagePreview('');
      setIsModalOpen(false);
      fetchGalleryImages();
    } catch (err) {
      // Помилка обробляється в handleSubmit
    }
  };

  const handleImageEdit = (image) => {
    const imageStyles = Array.isArray(image.styles) && image.styles.length ? image.styles : (image.style ? [image.style] : []);
    setImageForm({
      id: image._id,
      alt: image.alt || '',
      title: image.title || '',
      description: image.description || '',
      styles: imageStyles,
      image: null,
      imageUrl: image.src || '',
    });
    setImagePreview(image.src ? `http://localhost:5000${image.src}` : '');
    setIsModalOpen(true);
  };

  const handleImageDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це зображення?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/gallery/${id}`, 'DELETE');
      toast.success('Зображення видалено!', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'delete-image-toast',
      });
      fetchGalleryImages();
    } catch (err) {
      // Помилка обробляється в handleSubmit
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageForm({ ...imageForm, image: file });
  
    if (file) {
      // Видаляємо попередню URL, якщо є
      if (prevImageRef.current) {
        URL.revokeObjectURL(prevImageRef.current);
      }
  
      const previewUrl = URL.createObjectURL(file);
      prevImageRef.current = previewUrl;
      setImagePreview(previewUrl);
    } else {
      setImagePreview(imageForm.imageUrl ? `http://localhost:5000${imageForm.imageUrl}` : '');
    }
  };
  

  const handleImageClear = () => {
    if (prevImageRef.current) {
      URL.revokeObjectURL(prevImageRef.current);
      prevImageRef.current = null;
    }
    setImageForm({ ...imageForm, image: null, imageUrl: '' });
    setImagePreview('');
  };

  const handleStylesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
    setImageForm({ ...imageForm, styles: selected });
  };

  const closeModal = () => {
    if (prevImageRef.current) {
      URL.revokeObjectURL(prevImageRef.current);
      prevImageRef.current = null;
    }
    setIsModalOpen(false);
    setImageForm({ id: '', alt: '', title: '', description: '', styles: [], image: null, imageUrl: '' });
    setImagePreview('');
  };

  const ImageForm = ({ isModal = false }) => (
    <form className="admin-form" onSubmit={handleImageSubmit}>
      <div className="form-group">
        <label>Зображення</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={!imageForm.id}
        />
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
        {Array.isArray(galleryCategories) && galleryCategories.length > 0 ? (
          <select multiple value={imageForm.styles} onChange={handleStylesChange} required>
            {galleryCategories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
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
      {isModal ? (
        <div className="modal-actions">
          <button type="submit" className="submit-btn">
            {imageForm.id ? 'Оновити зображення' : 'Додати зображення'}
          </button>
          <button type="button" className="cancel-btn" onClick={closeModal}>
            Скасувати
          </button>
        </div>
      ) : (
        <button type="submit" className="submit-btn">
          Додати зображення
        </button>
      )}
    </form>
  );

  return (
    <div className={`gallery-management ${mode}`}>
      {mode === 'add' && (
        <>
          <h3>Додати зображення</h3>
          <ImageForm />
        </>
      )}

      {mode === 'edit' && (
        <>
          <h3>Редагувати зображення</h3>
          <div className="gallery-tabs">
            {['All', ...(Array.isArray(galleryCategories) ? galleryCategories.map((cat) => cat.name) : [])].map((style) => (
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
              .filter((img) => {
                if (activeStyle === 'All') return true;
                const styles = Array.isArray(img.styles) && img.styles.length ? img.styles : (img.style ? [img.style] : []);
                return styles.includes(activeStyle);
              })
              .map((img) => (
                <div key={img._id} className="gallery-item-admin">
                  <img src={`http://localhost:5000${img.src}`} alt={img.alt || ''} className="gallery-item-image" />
                  <div className="gallery-item-info">
                    <h3>{img.title || 'Без назви'}</h3>
                    <p>{img.description || 'Без опису'}</p>
                    <p>
                      <strong>Категорії:</strong>{' '}
                      {(Array.isArray(img.styles) && img.styles.length ? img.styles : (img.style ? [img.style] : [])).join(', ') || 'Немає'}
                    </p>
                    <div className="gallery-item-actions">
                      <button className="edit-btn" onClick={() => handleImageEdit(img)}>
                        Редагувати
                      </button>
                      <button className="delete-btn" onClick={() => handleImageDelete(img._id)}>
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            className="modal"
            overlayClassName="modal-overlay"
          >
            <h2>{imageForm.id ? 'Редагувати зображення' : 'Додати зображення'}</h2>
            <ImageForm isModal={true} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default GalleryManagement;