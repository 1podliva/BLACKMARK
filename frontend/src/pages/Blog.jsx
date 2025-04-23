import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <section className="blog-section" id="blog">
      <div className="blog-content">
        <div className="intro-block">
          <h2 className="section-subtitle">Наш блог</h2>
          <h1 className="main-title">
            <span className="first-line">Натхнення</span>
            <span className="second-line">Та знання</span>
          </h1>
          <div className="divider"></div>
          <p className="intro-text">
            Відкрийте для себе світ татуювань через наші статті, поради та історії.
          </p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="blog-controls">
          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category._id || 'all'}
                className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Пошук статей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {featuredPost && (
          <div className="featured-post">
            <div className="featured-image-container">
              <img src={featuredPost.image} alt={featuredPost.title} className="featured-image" />
            </div>
            <div className="featured-content">
              <span className="post-category">{featuredPost.category}</span>
              <h3 className="featured-title">{featuredPost.title}</h3>
              <p className="featured-excerpt">{featuredPost.content.substring(0, 100)}...</p>
              <button
                className="read-more-btn"
                onClick={() => handlePostClick(featuredPost._id)}
              >
                Читати далі
              </button>
            </div>
          </div>
        )}

        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="blog-post"
              onClick={() => handlePostClick(post._id)}
            >
              <div className="post-image-container">
                <img src={post.image} alt={post.title} className="post-image" />
              </div>
              <div className="post-content">
                <span className="post-category">{post.category}</span>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.content.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <p className="no-results">Статей за вашим запитом не знайдено.</p>
        )}
      </div>
    </section>
  );
};

export default Blog;