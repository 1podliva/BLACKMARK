import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './GalleryCategoryManagement.css';

const GalleryCategoryManagement = ({ galleryCategories, setGalleryCategories, handleSubmit, toast, fetchGalleryCategories }) => {
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Назва категорії обов’язкова', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    try {
      const url = categoryForm.id ? `http://localhost:5000/api/gallery-categories/${categoryForm.id}` : 'http://localhost:5000/api/gallery-categories';
      const method = categoryForm.id ? 'PUT' : 'POST';
      await handleSubmit(url, method, { name: categoryForm.name });
      toast.success(categoryForm.id ? 'Категорію оновлено!' : 'Категорію додано!', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: categoryForm.id ? 'update-category-toast' : 'create-category-toast',
      });
      setCategoryForm({ id: '', name: '' });
      fetchGalleryCategories();
    } catch (err) {
      // Помилка обробляється в handleSubmit
    }
  };

  const handleCategoryEdit = (category) => {
    setCategoryForm({ id: category._id, name: category.name });
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю категорію?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/gallery-categories/${id}`, 'DELETE');
      toast.success('Категорію видалено!', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'delete-category-toast',
      });
      fetchGalleryCategories();
    } catch (err) {
      // Помилка обробляється в handleSubmit
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
          galleryCategories.map((category) => (
            <div key={category._id} className="category-item">
              <span>{category.name}</span>
              <div className="category-actions">
                <button className="edit-btn" onClick={() => handleCategoryEdit(category)}>
                  Редагувати
                </button>
                <button className="delete-btn" onClick={() => handleCategoryDelete(category._id)}>
                  Видалити
                </button>
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