import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setSuccess('Вхід успішний!');
        setTimeout(onClose, 1000);
      } else {
        setError(result.message);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Паролі не співпадають');
        return;
      }
      const result = await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      if (result.success) {
        setSuccess('Реєстрація успішна!');
        setTimeout(onClose, 1000);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Ім’я</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Прізвище</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Підтвердження пароля</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="submit-btn">
            {isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>
        <p>
          {isLogin ? 'Немає акаунта?' : 'Вже є акаунт?'}
          <button
            className="toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
              });
            }}
          >
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </button>
        </p>
        {isLogin && (
          <p>
            <a href="/forgot-password">Забули пароль?</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthModal;