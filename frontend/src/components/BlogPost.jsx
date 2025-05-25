import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fetchPost = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Не вдалося завантажити пост');
      const data = await res.json();
      setPost(data);
    } catch (err) {
      toast.error(err.message, { toastId: 'fetch-post-error', autoClose: 3000 });
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Будь ласка, увійдіть, щоб залишити коментар', { toastId: 'auth-error-comment', autoClose: 3000 });
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Не вдалося додати коментар');
      }
      const updatedPost = await res.json();
      setPost(updatedPost);
      setCommentText('');
      toast.success('Коментар успішно додано!', { autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { toastId: 'add-comment-error', autoClose: 3000 });
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей коментар?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Не вдалося видалити коментар');
      }
      const updatedPost = await res.json();
      setPost(updatedPost);
      toast.success('Коментар видалено!', { autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { toastId: 'delete-comment-error', autoClose: 3000 });
    }
  };

  const handleCommentEditStart = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.text);
  };

  const handleCommentEditSubmit = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editCommentText }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Не вдалося оновити коментар');
      }
      const updatedPost = await res.json();
      setPost(updatedPost);
      setEditingCommentId(null);
      setEditCommentText('');
      toast.success('Коментар оновлено!', { autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { toastId: 'edit-comment-error', autoClose: 3000 });
    }
  };

  const handleLike = async () => {
    if (!token) {
      toast.error('Будь ласка, увійдіть, щоб поставити лайк', { toastId: 'auth-error-like', autoClose: 3000 });
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося поставити лайк');
      await fetchPost();
    } catch (err) {
      toast.error(err.message, { toastId: 'like-error', autoClose: 3000 });
    }
  };

  const handleDislike = async () => {
    if (!token) {
      toast.error('Будь ласка, увійдіть, щоб поставити дизлайк', { toastId: 'auth-error-dislike', autoClose: 3000 });
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/dislike`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося поставити дизлайк');
      await fetchPost();
    } catch (err) {
      toast.error(err.message, { toastId: 'dislike-error', autoClose: 3000 });
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <section className="blog-post-section">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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
            <i className="fas fa-comments"></i> Коментарі ({post.comments.length})
          </button>
        </div>

        <div className="comments-section">
          <h3>
            <i className="fas fa-comments"></i> Коментарі ({post.comments.length})
          </h3>
          {post.comments.map((comment) => (
            <div key={comment._id} className="comment">
              {editingCommentId === comment._id ? (
                <div className="edit-comment-form">
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    required
                  />
                  <div className="edit-comment-actions">
                    <button
                      onClick={() => handleCommentEditSubmit(comment._id)}
                      className="save-comment-btn"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="cancel-comment-btn"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    <strong>
                      {comment.user && comment.user.firstName && comment.user.lastName
                        ? `${comment.user.firstName} ${comment.user.lastName}`
                        : 'Невідомий користувач'}
                    </strong>: {comment.text}
                  </p>
                  <div className="comment-date">
                    <span className="date-text">{new Date(comment.createdAt).toLocaleDateString('uk-UA')}</span>
                    <span className="time-text">{new Date(comment.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
                    {comment.isEdited && <span className="edited-status">(змінено)</span>}
                  </div>
                  {(user?._id === comment.user._id || user?.role === 'admin') && (
                    <div className="comment-actions">
                      {user?._id === comment.user._id && (
                        <button
                          onClick={() => handleCommentEditStart(comment)}
                          className="edit-comment-btn"
                          title="Редагувати"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="delete-comment-btn"
                        title="Видалити"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {user && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Напишіть коментар..."
                required
              />
              <button type="submit" className="comment-submit-btn">
                <i className="fas fa-paper-plane"></i> Надіслати
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogPost;