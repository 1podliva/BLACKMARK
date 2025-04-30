import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTimes, FaTrash } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './PostManagement.css';


const PostManagement = ({ mode, posts, categories, setPosts, handleSubmit, setError, setSuccess, fetchPosts }) => {
  const [postForm, setPostForm] = useState({
    id: '',
    title: '',
    content: '',
    category: '',
    image: null,
    status: 'draft',
    featured: false,
    existingImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Очищення форми при зміні режиму
  useEffect(() => {
    setPostForm({
      id: '',
      title: '',
      content: '',
      category: '',
      image: null,
      status: 'draft',
      featured: false,
      existingImage: null,
    });
    setPreviewImage(null);
  }, [mode]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!postForm.title.trim()) {
      toast.error('Заголовок обов’язковий', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    if (!postForm.content.trim()) {
      toast.error('Контент обов’язковий', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }
    if (!postForm.category) {
      toast.error('Виберіть категорію', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'form-error-toast',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', postForm.title);
      formData.append('content', postForm.content);
      const selectedCategory = categories.find((cat) => cat._id === postForm.category);
      formData.append('category', selectedCategory ? selectedCategory.name : '');
      formData.append('status', postForm.status);
      formData.append('featured', postForm.featured);
      if (postForm.image) {
        formData.append('image', postForm.image);
      } else if (postForm.existingImage) {
        formData.append('image', postForm.existingImage);
      }

      const url = postForm.id
        ? `http://localhost:5000/api/posts/${postForm.id}`
        : 'http://localhost:5000/api/posts';
      const method = postForm.id ? 'PUT' : 'POST';

      console.log('Submitting post:', { url, method, status: postForm.status, featured: postForm.featured, content: postForm.content });
      await handleSubmit(url, method, formData, true);
      toast.success(postForm.id ? 'Пост оновлено!' : 'Пост створено!', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: postForm.id ? 'update-post-toast' : 'create-post-toast',
      });
      setPostForm({
        id: '',
        title: '',
        content: '',
        category: '',
        image: null,
        status: 'draft',
        featured: false,
        existingImage: null,
      });
      setPreviewImage(null);
      fetchPosts();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  const handlePostEdit = (post) => {
    const category = categories.find((cat) => cat.name === post.category);
    setPostForm({
      id: post._id,
      title: post.title,
      content: post.content,
      category: category?._id || '',
      image: null,
      status: post.status || 'draft',
      featured: post.featured || false,
      existingImage: post.image || null,
    });
    setPreviewImage(post.image ? `http://localhost:5000${post.image}` : null);
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей пост?')) return;
    try {
      console.log('Deleting post ID:', id);
      await handleSubmit(`http://localhost:5000/api/posts/${id}`, 'DELETE');
      toast.success('Пост видалено!', {
        className: 'admin-toast',
        autoClose: 3000,
        toastId: 'delete-post-toast',
      });
      fetchPosts();
    } catch (err) {
      // Помилка встановлюється в handleSubmit
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostForm({ ...postForm, image: file, existingImage: null });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setPostForm({ ...postForm, image: null, existingImage: null });
    setPreviewImage(null);
  };

  const getCategoryName = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category ? category.name : 'Без категорії';
  };

  if (mode === 'add') {
    return (
      <div className="admin-post-management">
        <h3>Додати пост</h3>
        <form className="admin-form" onSubmit={handlePostSubmit}>
          <div className="admin-form-group">
            <label>Заголовок</label>
            <input
              type="text"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              placeholder="Введіть заголовок поста"
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Контент</label>
            <CKEditor
              editor={ClassicEditor}
              data={postForm.content}
              onChange={(event, editor) => {
                const data = editor.getData();
                setPostForm({ ...postForm, content: data });
              }}
              config={{
                toolbar: [
                  'heading', '|',
                  'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                  'undo', 'redo'
                ],
                htmlSupport: {
                  allow: [
                    {
                      name: /.*/,
                      attributes: ['data-start', 'data-end'],
                    },
                  ],
                },
              }}
            />
          </div>
          <div className="admin-form-group">
            <label>Категорія</label>
            <select
              value={postForm.category}
              onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
              required
            >
              <option value="">Виберіть категорію</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-group">
            <label>Зображення (опціонально)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {previewImage && (
              <div className="admin-image-preview-container">
                <img src={previewImage} alt="Preview" className="admin-image-preview" />
                <button type="button" className="admin-remove-image-btn" onClick={handleRemoveImage}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          <div className="admin-form-group">
            <label>Статус</label>
            <select
              value={postForm.status}
              onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
            >
              <option value="draft">Чернетка</option>
              <option value="published">Опубліковано</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>
              <input
                type="checkbox"
                checked={postForm.featured}
                onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })}
              />
              Рекомендований пост
            </label>
          </div>
          <button type="submit" className="admin-submit-btn">
            Створити пост
          </button>
        </form>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="admin-post-management">
        <h3>Редагувати пости</h3>
        {postForm.id ? (
          <form className="admin-form" onSubmit={handlePostSubmit}>
            <div className="admin-form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="Введіть заголовок поста"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Контент</label>
              <CKEditor
                editor={ClassicEditor}
                data={postForm.content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setPostForm({ ...postForm, content: data });
                }}
                config={{
                  toolbar: [
                    'heading', '|',
                    'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                    'undo', 'redo'
                  ],
                  htmlSupport: {
                    allow: [
                      {
                        name: /.*/,
                        attributes: ['data-start', 'data-end'],
                      },
                    ],
                  },
                }}
              />
            </div>
            <div className="admin-form-group">
              <label>Категорія</label>
              <select
                value={postForm.category}
                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                required
              >
                <option value="">Виберіть категорію</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Зображення (опціонально)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {previewImage && (
                <div className="admin-image-preview-container">
                  <img src={previewImage} alt="Preview" className="admin-image-preview" />
                  <button type="button" className="admin-remove-image-btn" onClick={handleRemoveImage}>
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            <div className="admin-form-group">
              <label>Статус</label>
              <select
                value={postForm.status}
                onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опубліковано</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>
                <input
                  type="checkbox"
                  checked={postForm.featured}
                  onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })}
                />
                Рекомендований пост
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-submit-btn">
                Оновити пост
              </button>
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={() =>
                  setPostForm({
                    id: '',
                    title: '',
                    content: '',
                    category: '',
                    image: null,
                    status: 'draft',
                    featured: false,
                    existingImage: null,
                  })
                }
              >
                Скасувати
              </button>
            </div>
          </form>
        ) : (
          <>
            <h4>Усі пости</h4>
            <div className="admin-posts-list">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id} className="admin-post-item">
                    <div className="admin-post-image">
                      {post.image ? (
                        <img src={`http://localhost:5000${post.image}`} alt={post.title} />
                      ) : (
                        <div className="admin-no-image">Без зображення</div>
                      )}
                    </div>
                    <div className="admin-post-info">
                      <span className="admin-post-title">{post.title}</span>
                      <span className="admin-post-category">{getCategoryName(post.category)}</span>
                      <span className="admin-post-status">
                        {post.status === 'draft' ? 'Чернетка' : 'Опубліковано'}
                      </span>
                      <span className="admin-post-featured">
                        {post.featured ? 'Рекомендований' : 'Звичайний'}
                      </span>
                    </div>
                    <div className="admin-post-actions">
                      <button className="admin-edit-btn" onClick={() => handlePostEdit(post)}>
                        <FaEdit />
                      </button>
                      <button className="admin-delete-btn" onClick={() => handlePostDelete(post._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Пости відсутні</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default PostManagement;
