import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPost();
  }, [id]);

  if (error) {
    return (
      <section className="blog-post-section">
        <div className="blog-post-content">
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="blog-post-section">
        <div className="blog-post-content">
          <p>Завантаження...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-post-section">
      <div className="blog-post-content">
        <div className="intro-block">
          <h2 className="section-subtitle">{post.category}</h2>
          <h1 className="main-title">{post.title}</h1>
          <div className="divider"></div>
          <p className="intro-text">
            Опубліковано: {new Date(post.createdAt).toLocaleDateString('uk-UA')}
          </p>
        </div>

        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt={post.title} className="post-image" />
          </div>
        )}

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </section>
  );
};

export default BlogPost;