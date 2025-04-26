import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './PostManagement.css';

const PostManagement = ({ posts, categories, setPosts, handleSubmit, setError, setSuccess, fetchPosts }) => {
  const [postForm, setPostForm] = useState({
    id: '',
    title: '',
    content: '',
    image: null,
    category: '',
    featured: false,
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState('');

  console.log('PostManagement categories:', categories);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!postForm.category) {
      setError('Будь ласка, виберіть категорію');
      return;
    }

    const formData = new FormData();
    formData.append('title', postForm.title);
    formData.append('content', postForm.content);
    formData.append('category', postForm.category);
    formData.append('featured', postForm.featured);
    if (postForm.image) formData.append('image', postForm.image);
    if (postForm.id && postForm.imageUrl && !postForm.image) formData.append('image', postForm.imageUrl);

    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      const url = postForm.id ? `http://localhost:5000/api/posts/${postForm.id}` : 'http://localhost:5000/api/posts';
      const method = postForm.id ? 'PUT' : 'POST';
      const data = await handleSubmit(url, method, formData, true);
      setSuccess(postForm.id ? 'Пост оновлено!' : 'Пост створено!');
      setPostForm({ id: '', title: '', content: '', image: null, category: '', featured: false, imageUrl: '' });
      setImagePreview('');
      fetchPosts();
    } catch (err) {
      // Error set by handleSubmit
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
    setImagePreview(post.image ? `http://localhost:5000${post.image}` : '');
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей пост?')) return;
    try {
      await handleSubmit(`http://localhost:5000/api/posts/${id}`, 'DELETE');
      setSuccess('Пост видалено!');
      fetchPosts();
    } catch (err) {
      // Error set by handleSubmit
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPostForm({ ...postForm, image: file });
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(postForm.imageUrl ? `http://localhost:5000${postForm.imageUrl}` : '');
    }
  };

  const handleImageClear = () => {
    setPostForm({ ...postForm, image: null, imageUrl: '' });
    setImagePreview('');
  };

  return (
    <div className="post-management">
      <h3>Керування постами</h3>
      <form className="admin-form" onSubmit={handlePostSubmit}>
        <div className="form-group">
          <label>Заголовок</label>
          <input
            type="text"
            value={postForm.title}
            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
            placeholder="Введіть заголовок"
            required
          />
        </div>
        <div className="form-group">
          <label>Контент</label>
          <Editor
            apiKey="r8dzuc4d4dm81ovnn3e6c2dromlmzfzi4tu6h10k5lpqt00h"
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
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button type="button" className="image-clear-btn" onClick={handleImageClear}>
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Категорія</label>
          {categories && categories.length > 0 ? (
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
          ) : (
            <p>Категорії не завантажено</p>
          )}
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
        {posts.length ? (
          posts.map((post) => (
            <div key={post._id} className="post-item">
              <span>{post.title}</span>
              <div className="post-actions">
                <button className="edit-btn" onClick={() => handlePostEdit(post)}>Редагувати</button>
                <button className="delete-btn" onClick={() => handlePostDelete(post._id)}>Видалити</button>
              </div>
            </div>
          ))
        ) : (
          <p>Пости відсутні</p>
        )}
      </div>
    </div>
  );
};

export default PostManagement;