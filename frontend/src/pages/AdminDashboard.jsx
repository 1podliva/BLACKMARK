import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaImage, FaFolder } from 'react-icons/fa';
import GalleryManagement from '../components/admin/GalleryManagement';
import PostManagement from '../components/admin/PostManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import GalleryCategoryManagement from '../components/admin/GalleryCategoryManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('gallery');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Invalid token');
        }
        console.log('Token verified successfully');
        // Завантажуємо дані лише після успішної верифікації
        fetchGalleryImages();
        fetchPosts();
        fetchCategories();
        fetchGalleryCategories();
      } catch (err) {
        console.error('Token verification error:', err);
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleSubmit = async (url, method, payload, isFormData = false) => {
    setError('');
    

    try {
      console.log('Request:', { url, method, token, payload });
      const headers = { Authorization: `Bearer ${token}` };
      if (!isFormData) headers['Content-Type'] = 'application/json';
      const body = isFormData ? payload : JSON.stringify(payload);
      const res = await fetch(url, { method, headers, body });
      console.log('Response status:', res.status, 'URL:', url);
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/admin/login');
          throw new Error('Invalid token. Please log in again.');
        }
        throw new Error(errorData.message || 'Failed to process request');
      }
      const responseData = await res.json();
      setSuccess('Operation successful!');
      console.log('Response data:', responseData);
      return responseData;
    } catch (err) {
      console.error('Request error:', err);
      setError(err.message);
      throw err;
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch gallery images');
      const data = await res.json();
      console.log('Fetched gallery images:', data);
      setGalleryImages(data);
    } catch (err) {
      console.error('Fetch gallery images error:', err);
      setError(err.message);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      console.log('Fetched posts:', data);
      setPosts(data);
    } catch (err) {
      console.error('Fetch posts error:', err);
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      console.log('Fetched post categories:', data);
      setCategories(data);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError(err.message);
    }
  };

  const fetchGalleryCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch gallery categories');
      const data = await res.json();
      console.log('Fetched gallery categories:', data);
      setGalleryCategories(data);
    } catch (err) {
      console.error('Fetch gallery categories error:', err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-dashboard">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Адмін Панель</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <nav className="sidebar-nav">
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
          <button className="sidebar-item logout" onClick={handleLogout}>
            <FaSignOutAlt className="sidebar-icon" /> Вийти
          </button>
        </nav>
      </div>
      <div className={`admin-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="intro-block">
          <p className="section-subtitle">Адмін Панель</p>
          <h1 className="main-title">
            <span className="first-line">Керування</span>
            <span className="second-line">BLACKMARK</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Ласкаво просимо до адмін-панелі BLACKMARK. Тут ви можете керувати галереєю, постами та категоріями.
          </p>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
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
      </div>
    </div>
  );
};

export default AdminDashboard;