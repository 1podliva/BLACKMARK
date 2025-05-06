import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const AdminDashboard = ({ onNotificationReceived }) => {
  const [activeSection, setActiveSection] = useState({ category: 'notifications', subcategory: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
          fetchNotifications(),
        ]);
      } catch (err) {
        toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
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
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
    }
  }, [token]);

  const fetchGalleryImages = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати зображення галереї');
      const data = await res.json();
      setGalleryImages(data);
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
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
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Не вдалося отримати категорії');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
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
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
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
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
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
      toast.error(err.message, { className: 'admin-toast', autoClose: 3000 });
      return [];
    }
  }, [token]);

  const handleSubmit = useCallback(
    async (url, method, payload, isFormData = false) => {
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
          toast.success('Операція успішна!', { className: 'admin-toast', autoClose: 3000 });
        }
        return responseData;
      } catch (err) {
        toast.error(err.message || 'Помилка запиту', { className: 'admin-toast', autoClose: 3000 });
        throw err;
      }
    },
    [token, navigate]
  );

  const handleNotification = useCallback(
    (notification) => {
      if (notification.consultation || notification.booking) {
        fetchBookings();
        fetchNotifications();
      }
    },
    [fetchBookings, fetchNotifications]
  );

  useEffect(() => {
    if (onNotificationReceived) {
      onNotificationReceived(handleNotification);
    }
  }, [onNotificationReceived, handleNotification]);

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="admin-toast-container"
      />
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
              toast={toast}
              notifications={notifications}
              fetchNotifications={fetchNotifications}
              onNotificationReceived={onNotificationReceived}
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
                  toast={toast}
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
                  toast={toast}
                  fetchGalleryImages={fetchGalleryImages}
                  galleryCategories={galleryCategories}
                />
              )}
              {activeSection.subcategory === 'manage-categories' && (
                <GalleryCategoryManagement
                  galleryCategories={galleryCategories}
                  setGalleryCategories={setGalleryCategories}
                  handleSubmit={handleSubmit}
                  toast={toast}
                  fetchGalleryCategories={fetchGalleryCategories}
                />
              )}
            </>
          )}
          {activeSection.category === 'posts' && (
            <>
              {activeSection.subcategory ===

 'add-post' && (
                <PostManagement
                  mode="add"
                  posts={posts}
                  categories={categories}
                  setPosts={setPosts}
                  handleSubmit={handleSubmit}
                  toast={toast}
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
                  toast={toast}
                  fetchPosts={fetchPosts}
                />
              )}
              {activeSection.subcategory === 'manage-categories' && (
                <CategoryManagement
                  categories={categories}
                  setCategories={setCategories}
                  handleSubmit={handleSubmit}
                  toast={toast}
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
                  toast={toast}
                  fetchBookings={fetchBookings}
                  onNotificationReceived={onNotificationReceived}
                />
              )}
            </>
          )}
          {activeSection.category === 'artists' && (
            <ArtistManagement
              artists={artists}
              setArtists={setArtists}
              handleSubmit={handleSubmit}
              toast={toast}
              fetchArtists={fetchArtists}
            />
          )}
          {activeSection.category === 'schedules' && (
            <ScheduleManagement
              token={token}
              toast={toast}
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