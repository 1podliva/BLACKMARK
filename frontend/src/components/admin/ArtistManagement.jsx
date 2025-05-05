import React, { useState, useRef } from 'react';
import './ArtistManagement.css';

const ArtistManagement = ({ artists, setArtists, handleSubmit, setError, setSuccess, fetchArtists }) => {
  const [form, setForm] = useState({ name: '', description: '', age: '', experience: '', photo: null });
  const [editingId, setEditingId] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const requiredFields = ['name', 'age', 'experience'];
      if (!requiredFields.every((field) => form[field].trim())) {
        setError('Усі обов’язкові поля (Ім’я, Вік, Стаж) повинні бути заповнені!');
        return;
      }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('age', form.age);
      formData.append('experience', form.experience);
      if (form.photo) {
        formData.append('photo', form.photo);
      }

      if (editingId) {
        const data = await handleSubmit(
          `http://localhost:5000/api/artists/${editingId}`,
          'PUT',
          formData,
          { 'Content-Type': 'multipart/form-data' }
        );
        setArtists(artists.map((a) => (a._id === editingId ? data : a)));
        setSuccess('Майстер успішно оновлено!');
        setEditingId(null);
      } else {
        const data = await handleSubmit(
          'http://localhost:5000/api/artists',
          'POST',
          formData,
          { 'Content-Type': 'multipart/form-data' }
        );
        setArtists([...artists, data]);
        setSuccess('Майстер успішно додано!');
      }
      setForm({ name: '', description: '', age: '', experience: '', photo: null });
      setPhotoPreview(null);
    } catch (err) {
      setError('Сталася помилка при збереженні. Спробуйте ще раз!');
    }
  };

  const handleEdit = (artist) => {
    setForm({
      name: artist.name,
      description: artist.description || '',
      age: artist.age || '',
      experience: artist.experience || '',
      photo: null
    });
    setPhotoPreview(artist.photo_url || null);
    setEditingId(artist._id);
  };

  const handleDelete = async (id) => {
    try {
      await handleSubmit(`http://localhost:5000/api/artists/${id}`, 'DELETE');
      setArtists(artists.filter((a) => a._id !== id));
      setSuccess('Майстер успішно видалено!');
    } catch (err) {
      setError('Сталася помилка при видаленні. Спробуйте ще раз!');
    }
  };

  const handleRefresh = () => {
    fetchArtists();
  };

  const handleAddNewMaster = () => {
    setForm({ name: '', description: '', age: '', experience: '', photo: null });
    setPhotoPreview(null);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="artist-management-panel">
      <h2>Панель керування майстрами</h2>
      <div className="controls">
        <button className="refresh-btn" onClick={handleRefresh}>
          Оновити список
        </button>
        <button className="add-btn" onClick={handleAddNewMaster}>
          Додати майстра
        </button>
      </div>

      <div className="form-container">
        <h3>{editingId ? 'Редагувати майстра' : 'Додати нового майстра'}</h3>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Ім’я майстра *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Опис</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Короткий опис майстра"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Вік *</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
              min="18"
              max="100"
            />
          </div>
          <div className="form-group">
            <label>Стаж (роки) *</label>
            <input
              type="number"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              required
              min="0"
              max="50"
            />
          </div>
          <div className="form-group">
            <label>Фото</label>
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              ) : (
                <p>Перетягніть фото сюди або натисніть, щоб вибрати</p>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingId ? 'Оновити' : 'Додати'}
            </button>
            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setForm({ name: '', description: '', age: '', experience: '', photo: null });
                  setPhotoPreview(null);
                  setEditingId(null);
                }}
              >
                Скасувати
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="artists-list">
        <h3>Список майстрів</h3>
        {artists.length > 0 ? (
          <table className="artists-table">
            <thead>
              <tr>
                <th>Ім’я</th>
                <th>Вік</th>
                <th>Стаж</th>
                <th>Фото</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist._id}>
                  <td>{artist.name}</td>
                  <td>{artist.age || 'Невідомо'}</td>
                  <td>{artist.experience || 'Невідомо'}</td>
                  <td>
                    {artist.photo_url ? (
                      <img src={artist.photo_url} alt={artist.name} className="preview-image" />
                    ) : (
                      'Відсутнє'
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(artist)} className="edit-btn">
                      Редагувати
                    </button>
                    <button onClick={() => handleDelete(artist._id)} className="delete-btn">
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Майстрів немає</p>
        )}
      </div>
    </div>
  );
};

export default ArtistManagement;