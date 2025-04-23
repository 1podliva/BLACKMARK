import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [postForm, setPostForm] = useState({
    id: '',
    title: '',
    content: '',
    image: null,
    category: '',
    featured: false,
    imageUrl: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', postForm.title);
    formData.append('content', postForm.content);
    formData.append('category', postForm.category);
    formData.append('featured', postForm.featured);
    if (postForm.image) formData.append('image', postForm.image);
    if (postForm.id && postForm.imageUrl) formData.append('image', postForm.imageUrl);

    try {
      const token = localStorage.getItem('token');
      const url = postForm.id ? `http://localhost:5000/api/posts/${postForm.id}` : 'http://localhost:5000/api/posts';
      const method = postForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to save post');
      await res.json();
      setSuccess(postForm.id ? 'Post updated!' : 'Post created!');
      setPostForm({ id: '', title: '', content: '', image: null, category: '', featured: false, imageUrl: '' });
      fetchPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = categoryForm.id ? `http://localhost:5000/api/categories/${categoryForm.id}` : 'http://localhost:5000/api/categories';
      const method = categoryForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryForm.name }),
      });

      if (!res.ok) throw new Error('Failed to save category');
      await res.json();
      setSuccess(categoryForm.id ? 'Category updated!' : 'Category created!');
      setCategoryForm({ id: '', name: '' });
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePostEdit = (post) => {
    setPostForm({
      id: post._id,
      title: post.title,
      content: post.content,
      image: null,
      imageUrl: post.image,
      category: post.category,
      featured: post.featured,
    });
  };

  const handleCategoryEdit = (category) => {
    setCategoryForm({
      id: category._id,
      name: category.name,
    });
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete post');
      setSuccess('Post deleted!');
      fetchPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete category');
      setSuccess('Category deleted!');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageChange = (e) => {
    setPostForm({ ...postForm, image: e.target.files[0] });
  };

  return (
    <section className="admin-section">
      <div className="admin-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Адмін-панель</h2>
          <h1 className="main-title">
            <span className="first-line">Керування</span>
            <span className="second-line">Блогом</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Створюйте, редагуйте та видаляйте пости та категорії з легкістю.
          </p>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* Category Management */}
        <div className="category-management">
          <h3>Керування категоріями</h3>
          <form className="category-form" onSubmit={handleCategorySubmit}>
            <div className="form-group">
              <label>Назва категорії</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              {categoryForm.id ? 'Оновити категорію' : 'Створити категорію'}
            </button>
          </form>

          <div className="category-list">
            <h4>Усі категорії</h4>
            {categories.map((category) => (
              <div key={category._id} className="category-item">
                <span>{category.name}</span>
                <div className="category-actions">
                  <button onClick={() => handleCategoryEdit(category)}>Редагувати</button>
                  <button onClick={() => handleCategoryDelete(category._id)}>Видалити</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Management */}
        <div className="post-management">
          <h3>Керування постами</h3>
          <form className="admin-form" onSubmit={handlePostSubmit}>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Контент</label>
              <Editor
                apiKey="no-api-key"
                value={postForm.content}
                onEditorChange={(content) => setPostForm({ ...postForm, content })}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic underline | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | link image | removeformat',
                  content_style: `
                    body { font-family:Arial,sans-serif; font-size:16px; color:#F8F9FA; background-color:#2C2C2C; }
                    p { margin: 10px 0; }
                    h1, h2, h3 { color: #F8F9FA; }
                  `,
                  skin: 'oxide-dark',
                  content_css: 'dark',
                }}
              />
            </div>
            <div className="form-group">
              <label>Зображення</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {postForm.imageUrl && !postForm.image && (
                <img src={postForm.imageUrl} alt="Current" className="image-preview" />
              )}
            </div>
            <div className="form-group">
              <label>Категорія</label>
              <select
                value={postForm.category}
                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                required
              >
                <option value="">Оберіть категорію</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={postForm.featured}
                  onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })}
                />
                Рекомендований пост
              </label>
            </div>
            <button type="submit" className="submit-btn">
              {postForm.id ? 'Оновити пост' : 'Створити пост'}
            </button>
          </form>

          <div className="posts-list">
            <h4>Усі пости</h4>
            {posts.map((post) => (
              <div key={post._id} className="post-item">
                <span>{post.title}</span>
                <div className="post-actions">
                  <button onClick={() => handlePostEdit(post)}>Редагувати</button>
                  <button onClick={() => handlePostDelete(post._id)}>Видалити</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;