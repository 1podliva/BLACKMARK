import React, { useState, useEffect } from 'react';
import './ScheduleManagement.css';

const ScheduleManagement = ({ token, toast, handleSubmit, fetchArtists }) => {
  const [schedules, setSchedules] = useState([]);
  const [artists, setArtists] = useState([]);
  const [form, setForm] = useState({
    artist: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const artistColors = [
    '#9B00FF',
    '#FF6B6B',
    '#4ECDC4',
    '#FFD93D',
    '#6B7280',
    '#FF9F43',
  ];

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [scheduleData, artistData] = await Promise.all([
          handleSubmit('http://localhost:5000/api/artist-schedules', 'GET'),
          fetchArtists(),
        ]);
        if (isMounted) {
          setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
          setArtists(Array.isArray(artistData) ? artistData : []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err.message || 'Помилка при завантаженні даних', { className: 'admin-toast', autoClose: 3000 });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [handleSubmit, fetchArtists, toast]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:5000/api/artist-schedules/${editId}`
        : 'http://localhost:5000/api/artist-schedules';
      const method = editId ? 'PUT' : 'POST';
      await handleSubmit(url, method, form);
      toast.success(editId ? 'Графік оновлено!' : 'Графік створено!', { className: 'admin-toast', autoClose: 3000 });
      setForm({ artist: '', date: '', startTime: '', endTime: '' });
      setEditId(null);
      const data = await handleSubmit('http://localhost:5000/api/artist-schedules', 'GET');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Помилка при збереженні графіку', { className: 'admin-toast', autoClose: 3000 });
    }
  };

  const handleEdit = (schedule) => {
    setForm({
      artist: schedule.artist?._id || '',
      date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setEditId(schedule._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей графік?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/artist-schedules/${id}`, 'DELETE');
      toast.success('Графік видалено!', { className: 'admin-toast', autoClose: 3000 });
      const data = await handleSubmit('http://localhost:5000/api/artist-schedules', 'GET');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Помилка при видаленні графіку', { className: 'admin-toast', autoClose: 3000 });
    }
  };

  const formatDate = (schedule) => {
    if (schedule.date) {
      return new Date(schedule.date).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return 'Невідома дата';
  };

  if (isLoading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="schedule-management">
      <h2>Керування графіками майстрів</h2>

      <h3>{editId ? 'Редагувати графік' : 'Додати графік'}</h3>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label>Майстер</label>
          <select
            value={form.artist}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
            required
          >
            <option value="">Виберіть майстра</option>
            {Array.isArray(artists) && artists.length > 0 ? (
              artists.map((artist) => (
                <option key={artist._id} value={artist._id}>
                  {artist.name}
                </option>
              ))
            ) : (
              <option disabled>Майстри відсутні</option>
            )}
          </select>
        </div>
        <div className="form-group">
          <label>Дата</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label>Початковий час</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Кінцевий час</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editId ? 'Оновити' : 'Додати'}
          </button>
          {editId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setForm({ artist: '', date: '', startTime: '', endTime: '' });
                setEditId(null);
              }}
            >
              Скасувати
            </button>
          )}
        </div>
      </form>

      <h3>Графіки майстрів</h3>
      {Array.isArray(schedules) && schedules.length > 0 ? (
        <div className="schedule-cards">
          {schedules.map((schedule, index) => (
            <div
              key={schedule._id}
              className="schedule-card"
              style={{ borderLeft: `4px solid ${artistColors[index % artistColors.length]}` }}
            >
              <div className="card-content">
                <p><strong>Майстер:</strong> {schedule.artist?.name || 'Невідомий'}</p>
                <p><strong>Дата:</strong> {formatDate(schedule)}</p>
                <p><strong>Години:</strong> {`${schedule.startTime} - ${schedule.endTime}`}</p>
              </div>
              <div className="card-actions">
                <button className="edit-btn" onClick={() => handleEdit(schedule)}>
                  Редагувати
                </button>
                <button className="delete-btn" onClick={() => handleDelete(schedule._id)}>
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Графіків немає</p>
      )}

      <h3>Таблиця графіків</h3>
      {Array.isArray(schedules) && schedules.length > 0 ? (
        <table className="schedules-table">
          <thead>
            <tr>
              <th>Майстер</th>
              <th>Дата</th>
              <th>Години</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr
                key={schedule._id}
                style={{ borderLeft: `4px solid ${artistColors[index % artistColors.length]}` }}
              >
                <td>{schedule.artist?.name || 'Невідомий'}</td>
                <td>{formatDate(schedule)}</td>
                <td>{`${schedule.startTime} - ${schedule.endTime}`}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(schedule)}>
                    Редагувати
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(schedule._id)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Графіків немає</p>
      )}
    </div>
  );
};

export default ScheduleManagement;