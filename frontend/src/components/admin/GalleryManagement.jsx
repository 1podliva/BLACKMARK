import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import ImageForm from './ImageForm'; // Імпортуємо окремий компонент
import './GalleryManagement.css';

Modal.setAppElement('#root');

const GalleryManagement = React.memo(({ galleryImages, setGalleryImages, handleSubmit, toast, fetchGalleryImages, galleryCategories, mode }) => {
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
  const inputRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    if (process.env.NODE_ENV === 'development' && isMounted.current) {
      console.log('Gallery images:', galleryImages);
      console.log('Gallery categories:', galleryCategories);
      console.log('Mode:', mode);
    }
    return () => {
      isMounted.current = false;
      if (prevImageRef.current) URL.revokeObjectURL(prevImageRef.current);
    };
  }, [galleryImages, galleryCategories, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setImageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageForm((prev) => ({ ...prev, image: file }));
      if (prevImageRef.current) URL.revokeObjectURL(prevImageRef.current);
      prevImageRef.current = URL.createObjectURL(file);
      setImagePreview(prevImageRef.current);
    } else {
      setImagePreview(imageForm.imageUrl ? `http://localhost:5000${imageForm.imageUrl}` : '');
      setImageForm((prev) => ({ ...prev, image: null }));
      if (inputRef.current && isMounted.current) inputRef.current.focus();
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = !imageForm.styles.length || !imageForm.title.trim() || !imageForm.description.trim() || !imageForm.alt.trim() || (!imageForm.id && !imageForm.image);
    if (hasErrors) {
      toast.error('Перевірте всі поля та категорії', { className: 'admin-toast', autoClose: 3000 });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('alt', imageForm.alt);
      formData.append('title', imageForm.title);
      formData.append('description', imageForm.description);
      imageForm.styles.forEach((style) => formData.append('styles', style));
      if (imageForm.image) formData.append('image', imageForm.image);

      const url = imageForm.id ? `http://localhost:5000/api/gallery/${imageForm.id}` : 'http://localhost:5000/api/gallery';
      const method = imageForm.id ? 'PUT' : 'POST';
      await handleSubmit(url, method, formData, true);
      toast.success(imageForm.id ? 'Зображення оновлено!' : 'Зображення додано!', { className: 'admin-toast', autoClose: 3000 });
      setImageForm({ id: '', alt: '', title: '', description: '', styles: [], image: null, imageUrl: '' });
      setImagePreview('');
      setIsModalOpen(false);
      fetchGalleryImages();
    } catch (err) {}
  };

  const handleImageEdit = (image) => {
    const imageStyles = Array.isArray(image.styles) && image.styles.length ? image.styles : (image.style ? [image.style] : []);
    setImageForm({ id: image._id, alt: image.alt || '', title: image.title || '', description: image.description || '', styles: imageStyles, image: null, imageUrl: image.src || '' });
    setImagePreview(image.src ? `http://localhost:5000${image.src}` : '');
    setIsModalOpen(true);
  };

  const handleImageDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це зображення?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/gallery/${id}`, 'DELETE');
      toast.success('Зображення видалено!', { className: 'admin-toast', autoClose: 3000 });
      fetchGalleryImages();
    } catch (err) {}
  };

  const handleImageClear = () => {
    if (prevImageRef.current) URL.revokeObjectURL(prevImageRef.current);
    prevImageRef.current = null;
    setImageForm((prev) => ({ ...prev, image: null, imageUrl: '' }));
    setImagePreview('');
    if (inputRef.current && isMounted.current) inputRef.current.focus();
  };

  const handleStylesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
    setImageForm((prev) => ({ ...prev, styles: selected }));
  };

  const closeModal = () => {
    if (prevImageRef.current) URL.revokeObjectURL(prevImageRef.current);
    prevImageRef.current = null;
    setIsModalOpen(false);
    setImageForm({ id: '', alt: '', title: '', description: '', styles: [], image: null, imageUrl: '' });
    setImagePreview('');
  };

  return (
    <div className={`gallery-management ${mode}`}>
      {mode === 'add' && (
        <>
          <h3>Додати зображення</h3>
          <ImageForm
            imageForm={imageForm}
            imagePreview={imagePreview}
            onSubmit={handleImageSubmit}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            handleStylesChange={handleStylesChange}
            handleImageClear={handleImageClear}
            closeModal={closeModal}
            galleryCategories={galleryCategories}
            inputRef={inputRef}
          />
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
                data-tooltip={style === 'All' ? 'Показати всі' : `Фільтр: ${style}`}
              >
                {style}
              </button>
            ))}
          </div>
          <div className="gallery-list">
            {galleryImages
              .filter((img) => {
                const styles = Array.isArray(img.styles) && img.styles.length ? img.styles : (img.style ? [img.style] : []);
                return activeStyle === 'All' || styles.includes(activeStyle);
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
                      <button className="edit-btn" onClick={() => handleImageEdit(img)}>Редагувати</button>
                      <button className="delete-btn" onClick={() => handleImageDelete(img._id)}>Видалити</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            shouldCloseOnOverlayClick={false}
            className="modal"
            overlayClassName="modal-overlay"
          >
            <h2>{imageForm.id ? 'Редагувати зображення' : 'Додати зображення'}</h2>
            <ImageForm
              imageForm={imageForm}
              imagePreview={imagePreview}
              isModal={true}
              onSubmit={handleImageSubmit}
              handleChange={handleChange}
              handleImageChange={handleImageChange}
              handleStylesChange={handleStylesChange}
              handleImageClear={handleImageClear}
              closeModal={closeModal}
              galleryCategories={galleryCategories}
              inputRef={inputRef}
            />
          </Modal>
        </>
      )}
    </div>
  );
});

export default GalleryManagement;