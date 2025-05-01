import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Sidebar from '../components/admin/Sidebar';
import GalleryManagement from '../components/admin/GalleryManagement';
import PostManagement from '../components/admin/PostManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import GalleryCategoryManagement from '../components/admin/GalleryCategoryManagement';
import BookingManagement from '../components/admin/BookingManagement';
import NotificationManagement from '../components/admin/NotificationManagement';
import ArtistManagement from '../components/admin/ArtistManagement';
import ScheduleManagement from '../components/admin/ScheduleManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState({ category: 'notifications', subcategory: null });
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
  const [notifications, setNotifications] = useState([]); // Додаємо стан для повідомлень
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const subcategories = {
    gallery: [
      { id: 'add-image', label: 'Додати зображення' },
      { id: 'edit-images', label: 'Редагувати зображення' },
      { id: 'manage-categories', label: 'Управління категоріями' },
    ],
    posts: [
      { id: 'add-post', label: 'Додати пост' },
      { id: 'edit-posts', label: 'Редагувати пости' },
      { id: 'manage-categories', label: 'Управління категоріями' },
    ],
    bookings: [
      { id: 'add-booking', label: 'Додати бронювання' },
      { id: 'edit-bookings', label: 'Редагувати бронювання' },
    ],
  };

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
        await Promise.all([
          fetchGalleryImages(),
          fetchPosts(),
          fetchCategories(),
          fetchGalleryCategories(),
          fetchBookings(),
          fetchArtists(),
          fetchNotifications(), // Додаємо завантаження повідомлень
        ]);
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('token');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [token, navigate]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати повідомлення');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const handleSubmit = useCallback(
    async (url, method, payload, isFormData = false) => {
      setError('');
      try {
        const headers = { Authorization: `Bearer ${token}` };
        if (!isFormData) headers['Content-Type'] = 'application/json';
        const body = isFormData ? payload : JSON.stringify(payload);
        const res = await fetch(url, { method, headers, body });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            navigate('/');
            throw new Error('Доступ заборонено. Увійдіть як адміністратор.');
          }
          throw new Error(errorData.message || 'Не вдалося обробити запит');
        }
        const responseData = await res.json();
        if (method !== 'GET') {
          setSuccess('Операція успішна!');
          setTimeout(() => setSuccess(''), 3000);
        }
        return responseData;
      } catch (err) {
        setError(err.message || 'Помилка запиту');
        setTimeout(() => setError(''), 3000);
        throw err;
      }
    },
    [token, navigate]
  );

  const fetchGalleryImages = useCallback(async () => {
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
  }, [token]);

  const fetchPosts = useCallback(async () => {
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
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Не вдалося отримати категорії');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchGalleryCategories = useCallback(async () => {
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
  }, [token]);

  const fetchBookings = useCallback(async () => {
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
  }, [token]);

  const fetchArtists = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/artists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати майстрів');
      const data = await res.json();
      const artistsData = Array.isArray(data) ? data : [];
      setArtists(artistsData);
      return artistsData;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [token]);

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <>
      <img src="/images/Banner.svg" id="banner" alt="Banner" />
      <div className="admin-dashboard">
        <Sidebar
          activeSection={activeSection.category}
          setActiveSection={(category) => setActiveSection({ category, subcategory: null })}
          isSidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className={`admin-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <button className="sidebar-toggle mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          {activeSection.category !== 'notifications' &&
            activeSection.category !== 'artists' &&
            activeSection.category !== 'schedules' && (
              <div className="subcategory-nav">
                {subcategories[activeSection.category].map((sub) => (
                  <button
                    key={sub.id}
                    className={`subcategory-tab ${activeSection.subcategory === sub.id ? 'active' : ''}`}
                    onClick={() => setActiveSection({ ...activeSection, subcategory: sub.id })}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          {activeSection.category === 'notifications' && (
            <NotificationManagement
              token={token}
              setError={setError}
              setSuccess={setSuccess}
              notifications={notifications} // Передаємо повідомлення
              fetchNotifications={fetchNotifications} // Передаємо функцію для оновлення
            />
          )}
          {activeSection.category === 'gallery' && (
            <>
              {activeSection.subcategory === 'add-image' && (
                <GalleryManagement
                  mode="add"
                  galleryImages={galleryImages}
                  setGalleryImages={setGalleryImages}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchGalleryImages={fetchGalleryImages}
                  galleryCategories={galleryCategories}
                />
              )}
              {activeSection.subcategory === 'edit-images' && (
                <GalleryManagement
                  mode="edit"
                  galleryImages={galleryImages}
                  setGalleryImages={setGalleryImages}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchGalleryImages={fetchGalleryImages}
                  galleryCategories={galleryCategories}
                />
              )}
              {activeSection.subcategory === 'manage-categories' && (
                <GalleryCategoryManagement
                  galleryCategories={galleryCategories}
                  setGalleryCategories={setGalleryCategories}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchGalleryCategories={fetchGalleryCategories}
                />
              )}
            </>
          )}
          {activeSection.category === 'posts' && (
            <>
              {activeSection.subcategory === 'add-post' && (
                <PostManagement
                  mode="add"
                  posts={posts}
                  categories={categories}
                  setPosts={setPosts}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchPosts={fetchPosts}
                />
              )}
              {activeSection.subcategory === 'edit-posts' && (
                <PostManagement
                  mode="edit"
                  posts={posts}
                  categories={categories}
                  setPosts={setPosts}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchPosts={fetchPosts}
                />
              )}
              {activeSection.subcategory === 'manage-categories' && (
                <CategoryManagement
                  categories={categories}
                  setCategories={setCategories}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchCategories={fetchCategories}
                />
              )}
            </>
          )}
          {activeSection.category === 'bookings' && (
            <>
              {(activeSection.subcategory === 'add-booking' || activeSection.subcategory === 'edit-bookings') && (
                <BookingManagement
                  mode={activeSection.subcategory === 'add-booking' ? 'add' : 'edit'}
                  bookings={bookings}
                  setBookings={setBookings}
                  handleSubmit={handleSubmit}
                  setError={setError}
                  setSuccess={setSuccess}
                  fetchBookings={fetchBookings}
                />
              )}
            </>
          )}
          {activeSection.category === 'artists' && (
            <ArtistManagement
              artists={artists}
              setArtists={setArtists}
              handleSubmit={handleSubmit}
              setError={setError}
              setSuccess={setSuccess}
              fetchArtists={fetchArtists}
            />
          )}
          {activeSection.category === 'schedules' && (
            <ScheduleManagement
              token={token}
              setError={setError}
              setSuccess={setSuccess}
              handleSubmit={handleSubmit}
              fetchArtists={fetchArtists}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;