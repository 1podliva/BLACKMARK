import React, { useState, useEffect } from 'react';
import './ScheduleManagement.css';

const ScheduleManagement = ({ token, setError, setSuccess, handleSubmit, fetchArtists }) => {
  const [schedules, setSchedules] = useState([]);
  const [artists, setArtists] = useState([]);
  const [form, setForm] = useState({
    artist: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = [
    { value: 0, label: 'Неділя' },
    { value: 1, label: 'Понеділок' },
    { value: 2, label: 'Вівторок' },
    { value: 3, label: 'Середа' },
    { value: 4, label: 'Четвер' },
    { value: 5, label: 'П’ятниця' },
    { value: 6, label: 'Субота' },
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
          setError(err.message);
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
  }, [handleSubmit, fetchArtists]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:5000/api/artist-schedules/${editId}`
        : 'http://localhost:5000/api/artist-schedules';
      const method = editId ? 'PUT' : 'POST';
      await handleSubmit(url, method, form);
      setSuccess(editId ? 'Графік оновлено!' : 'Графік створено!');
      setForm({ artist: '', dayOfWeek: '', startTime: '', endTime: '' });
      setEditId(null);
      const data = await handleSubmit('http://localhost:5000/api/artist-schedules', 'GET');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (schedule) => {
    setForm({
      artist: schedule.artist?._id || '',
      dayOfWeek: schedule.dayOfWeek.toString(),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setEditId(schedule._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей графік?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/artist-schedules/${id}`, 'DELETE');
      setSuccess('Графік видалено!');
      const data = await handleSubmit('http://localhost:5000/api/artist-schedules', 'GET');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
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
          <label>День тижня</label>
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            required
          >
            <option value="">Виберіть день</option>
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
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
        <button type="submit" className="submit-btn">
          {editId ? 'Оновити' : 'Додати'}
        </button>
        {editId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setForm({ artist: '', dayOfWeek: '', startTime: '', endTime: '' });
              setEditId(null);
            }}
          >
            Скасувати
          </button>
        )}
      </form>

      <h3>Список графіків</h3>
      {Array.isArray(schedules) && schedules.length > 0 ? (
        <table className="schedules-table">
          <thead>
            <tr>
              <th>Майстер</th>
              <th>День тижня</th>
              <th>Години</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule._id}>
                <td>{schedule.artist?.name || 'Невідомий'}</td>
                <td>{daysOfWeek.find((d) => d.value === schedule.dayOfWeek)?.label}</td>
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