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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nextBooking, setNextBooking] = useState(null);

  useEffect(() => {
    const fetchNextBooking = async () => {
      if (!user || !token) return;
      try {
        const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookingsData = await bookingsRes.json();
        if (!bookingsRes.ok) throw new Error(bookingsData.message);

        const consultationsRes = await fetch('http://localhost:5000/api/bookings/consultations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const consultationsData = await consultationsRes.json();
        if (!consultationsRes.ok) throw new Error(consultationsData.message);

        const combined = [
          ...bookingsData.map((b) => ({ ...b, type: 'booking' })),
          ...consultationsData.map((c) => ({
            ...c,
            type: 'consultation',
            date: c.preferredDate,
          })),
        ];

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
    setIsMobileMenuOpen(false);
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setIsDropdownOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (window.innerWidth <= 768) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <img src="/images/Banner.svg" id="banner" alt="Banner" />
      <nav className="navbar">
        <h1 className="logo">BLACKMARK</h1>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link to="/" className={getActiveClass('/')} onClick={() => setIsMobileMenuOpen(false)}>
                Головна
              </Link>
            </li>
            <li>
              <Link to="/about" className={getActiveClass('/about')} onClick={() => setIsMobileMenuOpen(false)}>
                Про нас
              </Link>
            </li>
            <li>
              <Link to="/gallery" className={getActiveClass('/gallery')} onClick={() => setIsMobileMenuOpen(false)}>
                Галерея
              </Link>
            </li>
            <li>
              <Link to="/blog" className={getActiveClass('/blog')} onClick={() => setIsMobileMenuOpen(false)}>
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
            <li className="profile-mobile">
              {token ? (
                <div
                  className="profile-wrapper"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    id="profile-btn"
                    className={getActiveClass('/profile')}
                    onClick={handleProfileClick}
                  >
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
                          setIsMobileMenuOpen(false);
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
                      {user?.role === 'admin' && (
                        <div
                          className="dropdown-item"
                          onClick={() => {
                            navigate('/admin');
                            setIsDropdownOpen(false);
                            setIsMobileMenuOpen(false);
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
                <button
                  id="auth-btn"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Вхід / Реєстрація
                </button>
              )}
            </li>
          </ul>
        </div>

        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </nav>
    </>
  );
};

export default Header;