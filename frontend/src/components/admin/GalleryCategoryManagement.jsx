import React, { useState } from 'react';
import './GalleryCategoryManagement.css';

const GalleryCategoryManagement = ({ galleryCategories, setGalleryCategories, handleSubmit, setError, setSuccess, fetchGalleryCategories }) => {
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log('Submitting gallery category:', categoryForm);
    try {
      const url = categoryForm.id ? `http://localhost:5000/api/gallery-categories/${categoryForm.id}` : 'http://localhost:5000/api/gallery-categories';
      const method = categoryForm.id ? 'PUT' : 'POST';
      const data = await handleSubmit(url, method, { name: categoryForm.name });
      setSuccess(categoryForm.id ? 'Категорію оновлено!' : 'Категорію додано!');
      setCategoryForm({ id: '', name: '' });
      fetchGalleryCategories();
    } catch (err) {
      // Error set by handleSubmit
    }
  };

  const handleCategoryEdit = (category) => {
    setCategoryForm({ id: category._id, name: category.name });
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю категорію?')) return;
    console.log('Deleting gallery category ID:', id);
    try {
      const res = await handleSubmit(`http://localhost:5000/api/gallery-categories/${id}`, 'DELETE');
      console.log('Delete response:', res);
      setSuccess('Категорію видалено!');
      fetchGalleryCategories();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Не вдалося видалити категорію: ' + err.message);
    }
  };

  return (
    <div className="gallery-category-management">
      <h3>Керування категоріями галереї</h3>
      <form className="category-form" onSubmit={handleCategorySubmit}>
        <div className="form-group">
          <label>Назва категорії</label>
          <input
            type="text"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Введіть назву категорії"
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          {categoryForm.id ? 'Оновити категорію' : 'Додати категорію'}
        </button>
      </form>

      <div className="category-list">
        <h4>Усі категорії</h4>
        {galleryCategories.length ? (
          galleryCategories.map(category => (
            <div key={category._id} className="category-item">
              <span>{category.name}</span>
              <div className="category-actions">
                <button className="edit-btn" onClick={() => handleCategoryEdit(category)}>Редагувати</button>
                <button className="delete-btn" onClick={() => handleCategoryDelete(category._id)}>Видалити</button>
              </div>
            </div>
          ))
        ) : (
          <p>Категорій немає</p>
        )}
      </div>
    </div>
  );
};

export default GalleryCategoryManagement;