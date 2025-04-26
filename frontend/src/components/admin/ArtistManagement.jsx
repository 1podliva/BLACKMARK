import React, { useState } from 'react';

const ArtistManagement = ({ artists, setArtists, handleSubmit, setError, setSuccess, fetchArtists }) => {
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const data = await handleSubmit(
          `http://localhost:5000/api/artists/${editingId}`,
          'PUT',
          { name: form.name }
        );
        setArtists(artists.map((a) => (a._id === editingId ? data : a)));
        setEditingId(null);
      } else {
        const data = await handleSubmit('http://localhost:5000/api/artists', 'POST', { name: form.name });
        setArtists([...artists, data]);
      }
      setForm({ name: '' });
    } catch (err) {
      // Помилка вже оброблена в handleSubmit
    }
  };

  const handleEdit = (artist) => {
    setForm({ name: artist.name });
    setEditingId(artist._id);
  };

  const handleDelete = async (id) => {
    try {
      await handleSubmit(`http://localhost:5000/api/artists/${id}`, 'DELETE');
      setArtists(artists.filter((a) => a._id !== id));
    } catch (err) {
      // Помилка вже оброблена в handleSubmit
    }
  };

  return (
    <div className="artist-management">
      <h3>{editingId ? 'Редагувати майстра' : 'Додати майстра'}</h3>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label>Ім’я майстра</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          {editingId ? 'Оновити' : 'Додати'}
        </button>
        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setForm({ name: '' });
              setEditingId(null);
            }}
          >
            Скасувати
          </button>
        )}
      </form>

      <h3>Список майстрів</h3>
      {artists.length > 0 ? (
        <table className="artists-table">
          <thead>
            <tr>
              <th>Ім’я</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist._id}>
                <td>{artist.name}</td>
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
  );
};

export default ArtistManagement;