import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPost();
  }, [id, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in to comment');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const updatedPost = await res.json();
      setPost(updatedPost);
      setCommentText('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLike = async () => {
    if (!token) {
      setError('Please log in to like');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to like post');
      const updatedPost = await res.json();
      setPost(updatedPost);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDislike = async () => {
    if (!token) {
      setError('Please log in to dislike');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/dislike`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to dislike post');
      const updatedPost = await res.json();
      setPost(updatedPost);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!post) return <p>Loading...</p>;

  return (
    <section className="blog-post-section">
      <div className="blog-post-content">
        <div className="intro-block">
          <h2 className="section-subtitle">{post.category}</h2>
          <h1 className="main-title">{post.title}</h1>
          <div className="divider"></div>
        </div>
        {post.image && (
          <div className="post-image-container">
            <img
              src={`http://localhost:5000${post.image}`}
              alt={post.title}
              className="post-image"
            />
          </div>
        )}
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="interactions-bar">
          <button onClick={handleLike} className="interaction-btn">
            <i className="fas fa-thumbs-up"></i>
            <span className="interaction-count">({post.likes.length})</span>
          </button>
          <button onClick={handleDislike} className="interaction-btn">
            <i className="fas fa-thumbs-down"></i>
            <span className="interaction-count">({post.dislikes.length})</span>
          </button>
          <button className="comments-link" onClick={() => { /* Scroll to comments or handle click */ }}>
            <i className="fas fa-comments"></i> Comments ({post.comments.length})
          </button>
        </div>
        <div className="comments-section">
          <h3>
            <i className="fas fa-comments"></i> Comments ({post.comments.length})
          </h3>
          {post.comments.map((comment) => (
            <div key={comment._id} className="comment">
              <p><strong>{comment.user.name}</strong>: {comment.text}</p>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {user && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button type="submit" className="comment-submit-btn">
                <i className="fas fa-paper-plane"></i> Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogPost;