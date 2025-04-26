import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaImage, FaFolder, FaCalendar, FaBell, FaUser } from 'react-icons/fa';
import GalleryManagement from '../components/admin/GalleryManagement';
import PostManagement from '../components/admin/PostManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import GalleryCategoryManagement from '../components/admin/GalleryCategoryManagement';
import BookingManagement from '../components/admin/BookingManagement';
import NotificationManagement from '../components/admin/NotificationManagement';
import ArtistManagement from '../components/admin/ArtistManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const verifyAdminAccess = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/auth/check-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Доступ заборонено: тільки для адміністраторів');
        console.log('Адмін-доступ підтверджено');
        await Promise.all([
          fetchGalleryImages(),
          fetchPosts(),
          fetchCategories(),
          fetchGalleryCategories(),
          fetchBookings(),
          fetchArtists(),
        ]);
      } catch (err) {
        console.error('Помилка перевірки адмін-доступу:', err);
        setError(err.message);
        localStorage.removeItem('token');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [token, navigate]);

  const handleSubmit = async (url, method, payload, isFormData = false) => {
    setError('');
    setSuccess('');
    try {
      console.log('Request:', { url, method, token, payload });
      const headers = { Authorization: `Bearer ${token}` };
      if (!isFormData) headers['Content-Type'] = 'application/json';
      const body = isFormData ? payload : JSON.stringify(payload);
      const res = await fetch(url, { method, headers, body });
      console.log('Response status:', res.status, 'URL:', url);
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/');
          throw new Error('Доступ заборонено. Увійдіть як адміністратор.');
        }
        throw new Error(errorData.message || 'Не вдалося обробити запит');
      }
      const responseData = await res.json();
      setSuccess('Операція успішна!');
      setTimeout(() => setSuccess(''), 3000);
      console.log('Response data:', responseData);
      return responseData;
    } catch (err) {
      console.error('Request error:', err);
      setError(err.message);
      setTimeout(() => setError(''), 3000);
      throw err;
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати зображення галереї');
      const data = await res.json();
      setGalleryImages(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати пости');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Не вдалося отримати категорії');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchGalleryCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати категорії галереї');
      const data = await res.json();
      setGalleryCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати бронювання');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/artists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати майстрів');
      const data = await res.json();
      setArtists(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setSuccess('Вихід виконано! Перенаправлення...');
    setTimeout(() => navigate('/'), 3000);
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Адмін Панель</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveSection('notifications'); setSidebarOpen(false); }}
          >
            <FaBell className="sidebar-icon" /> Сповіщення
          </button>
          <button
            className={`sidebar-item ${activeSection === 'gallery' ? 'active' : ''}`}
            onClick={() => { setActiveSection('gallery'); setSidebarOpen(false); }}
          >
            <FaImage className="sidebar-icon" /> Галерея
          </button>
          <button
            className={`sidebar-item ${activeSection === 'gallery-categories' ? 'active' : ''}`}
            onClick={() => { setActiveSection('gallery-categories'); setSidebarOpen(false); }}
          >
            <FaFolder className="sidebar-icon" /> Категорії галереї
          </button>
          <button
            className={`sidebar-item ${activeSection === 'posts' ? 'active' : ''}`}
            onClick={() => { setActiveSection('posts'); setSidebarOpen(false); }}
          >
            <FaImage className="sidebar-icon" /> Пости
          </button>
          <button
            className={`sidebar-item ${activeSection === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveSection('categories'); setSidebarOpen(false); }}
          >
            <FaFolder className="sidebar-icon" /> Категорії постів
          </button>
          <button
            className={`sidebar-item ${activeSection === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveSection('bookings'); setSidebarOpen(false); }}
          >
            <FaCalendar className="sidebar-icon" /> Бронювання
          </button>
          <button
            className={`sidebar-item ${activeSection === 'artists' ? 'active' : ''}`}
            onClick={() => { setActiveSection('artists'); setSidebarOpen(false); }}
          >
            <FaUser className="sidebar-icon" /> Майстри
          </button>
          <button className="sidebar-item logout" onClick={handleLogout}>
            <FaSignOutAlt className="sidebar-icon" /> Вийти
          </button>
        </nav>
      </div>
      <div className={`admin-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="sidebar-toggle mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars />
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {activeSection === 'notifications' && (
          <NotificationManagement token={token} setError={setError} setSuccess={setSuccess} />
        )}
        {activeSection === 'gallery' && (
          <GalleryManagement
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
            handleSubmit={handleSubmit}
            setError={setError}
            setSuccess={setSuccess}
            fetchGalleryImages={fetchGalleryImages}
            galleryCategories={galleryCategories}
          />
        )}
        {activeSection === 'gallery-categories' && (
          <GalleryCategoryManagement
            galleryCategories={galleryCategories}
            setGalleryCategories={setGalleryCategories}
            handleSubmit={handleSubmit}
            setError={setError}
            setSuccess={setSuccess}
            fetchGalleryCategories={fetchGalleryCategories}
          />
        )}
        {activeSection === 'posts' && (
          <PostManagement
            posts={posts}
            categories={categories}
            setPosts={setPosts}
            handleSubmit={handleSubmit}
            setError={setError}
            setSuccess={setSuccess}
            fetchPosts={fetchPosts}
          />
        )}
        {activeSection === 'categories' && (
          <CategoryManagement
            categories={categories}
            setCategories={setCategories}
            handleSubmit={handleSubmit}
            setError={setError}
            setSuccess={setSuccess}
            fetchCategories={fetchCategories}
          />
        )}
        {activeSection === 'bookings' && (
          <BookingManagement
            bookings={bookings}
            setBookings={setBookings}
            handleSubmit={handleSubmit}
            setError={setError}
            setSuccess={setSuccess}
            fetchBookings={fetchBookings}
          />
        )}
        {activeSection === 'artists' && (
          <ArtistManagement
            artists={artists}
            setArtists={setArtists}
            handleSubmit={handleSubmit}
            setError={setError}
            setSuccess={setSuccess}
            fetchArtists={fetchArtists}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;