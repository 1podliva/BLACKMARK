import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';

const blogPosts = [
  {
    id: 1,
    title: 'Як обрати ідеальний дизайн татуювання?',
    excerpt: 'Поради щодо вибору стилю, розміру та місця для вашого першого татуювання.',
    image: '/images/blog/design-tips.jpg',
    category: 'Поради та догляд',
    featured: true,
  },
  {
    id: 2,
    title: 'Чи боляче робити татуювання?',
    excerpt: 'Розбираємо, що впливає на рівень болю та як підготуватися.',
    image: '/images/blog/pain-faq.jpg',
    category: 'Часті запитання',
  },
  {
    id: 3,
    title: 'Тату-культура: що надихає майстрів?',
    excerpt: 'Погляд на повсякденне життя тату-майстрів і їхні джерела натхнення.',
    image: '/images/blog/tattoo-culture.jpg',
    category: 'Битовуха з тату',
  },
  {
    id: 4,
    title: 'Моя перша татуювання: історія Анни',
    excerpt: 'Анна ділиться своїм досвідом створення татуювання в нашій студії.',
    image: '/images/blog/client-story-anna.jpg',
    category: 'Історії клієнтів',
  },
  {
    id: 5,
    title: 'Догляд за татуюванням: перші 2 тижні',
    excerpt: 'Крок за кроком: як правильно доглядати за новим татуюванням.',
    image: '/images/blog/aftercare-guide.jpg',
    category: 'Поради та догляд',
  },
  {
    id: 6,
    title: 'Чому татуювання вицвітають?',
    excerpt: 'Розбираємо причини вицвітання та як зберегти яскравість.',
    image: '/images/blog/fading-faq.jpg',
    category: 'Часті запитання',
  },
];

const categories = ['Усі', 'Часті запитання', 'Битовуха з тату', 'Поради та догляд', 'Історії клієнтів'];

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Усі');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'Усі' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((post) => post.featured);

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

        <div className="blog-controls">
          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
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
              <p className="featured-excerpt">{featuredPost.excerpt}</p>
              <button
                className="read-more-btn"
                onClick={() => handlePostClick(featuredPost.id)}
              >
                Читати далі
              </button>
            </div>
          </div>
        )}

        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="blog-post"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="post-image-container">
                <img src={post.image} alt={post.title} className="post-image" />
              </div>
              <div className="post-content">
                <span className="post-category">{post.category}</span>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt}</p>
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