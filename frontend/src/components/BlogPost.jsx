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

  if (error) return <p className="error-message">{error}</p>;
  if (!post) return <p>Loading...</p>;

  return (
    <section className="blog-post-section">
      <div className="blog-post-content">
        <h1 className="post-title">{post.title}</h1>
        <span className="post-category">{post.category}</span>
        {post.image && (
          <img
            src={`http://localhost:5000${post.image}`}
            alt={post.title}
            className="post-image"
          />
        )}
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </section>
  );
};

export default BlogPost;