import React from 'react';

const ImageForm = ({ imageForm, imagePreview, isModal = false, onSubmit, handleChange, handleImageChange, handleStylesChange, handleImageClear, closeModal, galleryCategories, inputRef }) => (
  <form className="admin-form" onSubmit={onSubmit} key="image-form">
    <div className="form-group">
      <label>Зображення</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        required={!imageForm.id}
        ref={inputRef}
      />
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button type="button" className="image-clear-btn" onClick={handleImageClear}>✕</button>
        </div>
      )}
    </div>
    <div className="form-group">
      <label>Заголовок</label>
      <input
        type="text"
        name="title"
        value={imageForm.title}
        onChange={handleChange}
        placeholder="Введіть заголовок"
        required
      />
    </div>
    <div className="form-group">
      <label>Опис</label>
      <input
        type="text"
        name="description"
        value={imageForm.description}
        onChange={handleChange}
        placeholder="Введіть опис"
        required
      />
    </div>
    <div className="form-group">
      <label>Категорії (утримуйте Ctrl для вибору кількох)</label>
      {Array.isArray(galleryCategories) && galleryCategories.length > 0 ? (
        <select multiple value={imageForm.styles} onChange={handleStylesChange} required>
          {galleryCategories.map((category) => (
            <option key={category._id} value={category.name}>{category.name}</option>
          ))}
        </select>
      ) : <p>Категорії не завантажено</p>}
    </div>
    <div className="form-group">
      <label>Alt текст</label>
      <input
        type="text"
        name="alt"
        value={imageForm.alt}
        onChange={handleChange}
        placeholder="Введіть alt текст"
        required
      />
    </div>
    {isModal ? (
      <div className="modal-actions">
        <button type="submit" className="submit-btn">{imageForm.id ? 'Оновити зображення' : 'Додати зображення'}</button>
        <button type="button" className="cancel-btn" onClick={closeModal}>Скасувати</button>
      </div>
    ) : <button type="submit" className="submit-btn">Додати зображення</button>}
  </form>
);

export default React.memo(ImageForm);