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

  useEffect(() => {
    fetchGalleryImages();
    fetchPosts();
    fetchCategories();
    fetchGalleryCategories();
  }, []);

  const handleSubmit = async (url, method, data, isFormData = false) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Request:', { url, method, token });
      const headers = isFormData ? { Authorization: `Bearer ${token}` } : {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const body = isFormData ? data : JSON.stringify(data);
      const res = await fetch(url, { method, headers, body });
      console.log('Response status:', res.status);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to process request');
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery images');
      const data = await res.json();
      console.log('Gallery images:', data);
      setGalleryImages(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchGalleryCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery-categories');
      if (!res.ok) throw new Error('Failed to fetch gallery categories');
      const data = await res.json();
      console.log('Gallery categories:', data);
      setGalleryCategories(data);
    } catch (err) {
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