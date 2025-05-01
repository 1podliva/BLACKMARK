import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nextBooking, setNextBooking] = useState(null);

  useEffect(() => {
    const fetchNextBooking = async () => {
      if (!user || !token) return;
      try {
        // Отримання бронювань
        const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookingsData = await bookingsRes.json();
        if (!bookingsRes.ok) throw new Error(bookingsData.message);

        // Отримання консультацій
        const consultationsRes = await fetch('http://localhost:5000/api/bookings/consultations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const consultationsData = await consultationsRes.json();
        if (!consultationsRes.ok) throw new Error(consultationsData.message);

        // Об'єднання бронювань і консультацій
        const combined = [
          ...bookingsData.map((b) => ({ ...b, type: 'booking' })),
          ...consultationsData.map((c) => ({
            ...c,
            type: 'consultation',
            date: c.preferredDate,
          })),
        ];

        // Фільтрація майбутніх записів зі статусом pending або confirmed
        const futureBookings = combined
          .filter(
            (item) =>
              new Date(item.date) >= new Date() &&
              (item.status === 'pending' || item.status === 'confirmed')
          )
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setNextBooking(futureBookings[0] || null);
      } catch (err) {
        console.error('Fetch next booking error:', err);
      }
    };
    fetchNextBooking();
  }, [user, token]);

  const handleContactsClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#contacts');
      setTimeout(() => {
        const contactsSection = document.getElementById('contacts');
        if (contactsSection) {
          contactsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const contactsSection = document.getElementById('contacts');
      if (contactsSection) {
        contactsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <img src="/images/Banner.svg" id="banner" alt="Banner" />
      <nav className="navbar">
        <h1 className="logo">BLACKMARK</h1>

        {/* Центральні лінки */}
        <div className="nav-links-container">
          <ul className="nav-links">
            <li>
              <Link to="/" className={getActiveClass('/')}>
                Головна
              </Link>
            </li>
            <li>
              <Link to="/about" className={getActiveClass('/about')}>
                Про нас
              </Link>
            </li>
            <li>
              <Link to="/gallery" className={getActiveClass('/gallery')}>
                Галерея
              </Link>
            </li>
            <li>
              <Link to="/blog" className={getActiveClass('/blog')}>
                Блог
              </Link>
            </li>
            <li>
              <a
                href="#contacts"
                className={location.hash === '#contacts' ? 'active' : ''}
                onClick={handleContactsClick}
              >
                Контакти
              </a>
            </li>
          </ul>
        </div>

        {/* Профіль або Вхід/Реєстрація */}
        <div className="profile">
          {token ? (
            <div
              className="profile-wrapper"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className={getActiveClass('/profile')}>
                Профіль
              </button>
              {isDropdownOpen && (
                <div className="dropdown">
                  <div className="dropdown-greeting">Привіт, {user?.firstName}!</div>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Мій профіль
                  </div>
                  {nextBooking ? (
                    <div className="dropdown-booking">
                      Наступне бронювання: {nextBooking.artist?.name || 'Невідомий'},{' '}
                      {new Date(nextBooking.date).toLocaleDateString()}, {nextBooking.time}
                    </div>
                  ) : (
                    <div className="dropdown-booking">Бронювань немає</div>
                  )}
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Мої бронювання
                  </div>
                  {user?.role === 'admin' && (
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/admin');
                        setIsDropdownOpen(false);
                      }}
                    >
                      Адмін-панель
                    </div>
                  )}
                  <div className="dropdown-item" onClick={handleLogout}>
                    Вийти
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)}>
              Вхід / Реєстрація
            </button>
          )}
        </div>

        {/* Модальне вікно для входу/реєстрації */}
        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </nav>
    </>
  );
};

export default Header;