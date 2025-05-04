import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Вхід успішний!', { theme: 'colored' });
        setTimeout(onClose, 1000);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Паролі не співпадають');
        }
        await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
        toast.success('Реєстрація успішна!', { theme: 'colored' });
        setTimeout(onClose, 1000);
      }
    } catch (error) {
      toast.error(error.message, { theme: 'colored' });
    }
  };

  return (
    <div className="auth-modal">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          backgroundColor: '#1A1A1D',
          color: '#F8F9FA',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      />
      <div className="auth-modal-content scale-in">
        <button className="close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="auth-header">
          <h2>{isLogin ? 'Ласкаво просимо!' : 'Створіть акаунт!'}</h2>
          <p>{isLogin ? 'Увійдіть у свій акаунт' : 'Зареєструйтесь, щоб продовжити'}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="name-group">
              <div className="auth-form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ім'я"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Прізвище"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="auth-form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-form-group">
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {!isLogin && (
            <div className="auth-form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Підтвердження пароля"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <button type="submit" className="submit-btn">
            {isLogin ? 'Увійти' : 'Зареєструватись'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Ще не з нами?' : 'Вже зареєстровані?'}
            <button
              className="toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                });
              }}
            >
              {isLogin ? 'Створити акаунт' : 'Увійти'}
            </button>
          </p>
          {isLogin && (
            <a href="/forgot-password" className="forgot-password">
              Забули пароль?
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;