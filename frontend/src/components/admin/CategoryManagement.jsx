import React, { useState } from 'react';
import './CategoryManagement.css';

const CategoryManagement = ({ categories, setCategories, handleSubmit, setError, setSuccess, fetchCategories }) => {
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
  });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!categoryForm.name.trim()) {
      setError('Назва категорії обов’язкова');
      return;
    }

    try {
      const url = categoryForm.id
        ? `http://localhost:5000/api/categories/${categoryForm.id}`
        : 'http://localhost:5000/api/categories';
      const method = categoryForm.id ? 'PUT' : 'POST';
      const payload = { name: categoryForm.name };
      console.log('Submitting category:', { url, method, payload });
      await handleSubmit(url, method, payload);
      setSuccess(categoryForm.id ? 'Категорію оновлено!' : 'Категорію створено!');
      setCategoryForm({ id: '', name: '' });
      fetchCategories();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  const handleCategoryEdit = (category) => {
    setCategoryForm({
      id: category._id,
      name: category.name,
    });
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю категорію?')) return;
    try {
      console.log('Deleting category ID:', id);
      await handleSubmit(`http://localhost:5000/api/categories/${id}`, 'DELETE');
      setSuccess('Категорію видалено!');
      fetchCategories();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  return (
    <div className="category-management">
      <h3>Керування категоріями постів</h3>
      <form className="admin-form" onSubmit={handleCategorySubmit}>
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

      <div className="categories-list">
        <h4>Усі категорії</h4>
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="category-item">
              <span>{category.name}</span>
              <div className="category-actions">
                <button className="edit-btn" onClick={() => handleCategoryEdit(category)}>Редагувати</button>
                <button className="delete-btn" onClick={() => handleCategoryDelete(category._id)}>Видалити</button>
              </div>
            </div>
          ))
        ) : (
          <p>Категорії відсутні</p>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;