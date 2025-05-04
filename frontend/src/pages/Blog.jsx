import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { convert } from 'html-to-text';
import './Blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Усі');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
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
        setCategories([{ name: 'Усі' }, ...data]);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPosts();
    fetchCategories();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'Усі' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((post) => post.featured);

  const handlePostClick = (id) => {
    navigate(`/blog/${id}`);
  };

  return (
    <section className="tattoo-blog-section" id="blog">
      <div className="tattoo-blog-content">
        <div className="tattoo-intro-block">
          <h2 className="tattoo-section-subtitle">Наш блог</h2>
          <h1 className="tattoo-main-title">
            <span className="tattoo-first-line">Натхнення</span>
            <span className="tattoo-second-line">Та знання</span>
          </h1>
          <div className="tattoo-divider"></div>
          <p className="tattoo-intro-text">
            Відкрийте для себе світ татуювань через наші статті, поради та історії.
          </p>
        </div>

        {error && <p className="tattoo-error-message">{error}</p>}

        <div className="tattoo-blog-controls">
          <div className="tattoo-category-filter">
            {categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category._id || 'all'}
                  className={`tattoo-category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <p>Категорії не завантажено</p>
            )}
          </div>
          <div className="tattoo-search-bar">
            <input
              type="text"
              placeholder="Пошук статей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {featuredPost && (
          <div className="tattoo-featured-post" onClick={() => handlePostClick(featuredPost._id)}>
            <div className="tattoo-featured-image-container">
              {featuredPost.image ? (
                <img
                  src={`http://localhost:5000${featuredPost.image}`}
                  alt={featuredPost.title}
                  className="tattoo-featured-image"
                />
              ) : (
                <div className="tattoo-image-placeholder">Немає зображення</div>
              )}
              <div className="tattoo-featured-overlay">
                <span className="tattoo-post-category">{featuredPost.category}</span>
                <h3 className="tattoo-featured-title">{featuredPost.title}</h3>
                <p className="tattoo-featured-excerpt">
                  {convert(featuredPost.content, { wordwrap: false }).substring(0, 100)}...
                </p>
                <button className="tattoo-read-more-btn">
                  Читати далі
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="tattoo-blog-grid">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="tattoo-blog-post"
              onClick={() => handlePostClick(post._id)}
            >
              <div className="tattoo-post-image-container">
                {post.image ? (
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    className="tattoo-post-image"
                  />
                ) : (
                  <div className="tattoo-image-placeholder">Немає зображення</div>
                )}
              </div>
              <div className="tattoo-post-content">
                <span className="tattoo-post-category">{post.category}</span>
                <h3 className="tattoo-post-title">{post.title}</h3>
                <p className="tattoo-post-excerpt">
                  {convert(post.content, { wordwrap: false }).substring(0, 100)}...
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <p className="tattoo-no-results">Статей за вашим запитом не знайдено.</p>
        )}
      </div>
    </section>
  );
};

export default Blog;