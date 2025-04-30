import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Main from './components/Main';
import About from './components/About';
import BlogIntro from './components/BlogIntro';
import Contacts from './components/Contacts';
import Consultation from './components/Consultation';
import HomeGalleryPreview from './components/HomeGalleryPreview';
import Footer from './components/Footer';
import Blog from './pages/Blog';
import BlogPost from './components/BlogPost';
import Gallery from './components/Gallery';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotificationProvider from './components/NotificationProvider';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Main />
              <About />
              {/* <PricingSection /> */}
              <HomeGalleryPreview />
              <Consultation />
              <BlogIntro />
              <Contacts />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Header />
              <About />
              <Footer />
            </>
          }
        />
        <Route
          path="/gallery"
          element={
            <>
              <Header />
              <Gallery />
              <Footer />
            </>
          }
        />
        <Route
          path="/blog"
          element={
            <>
              <Header />
              <Blog />
              <Footer />
            </>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <>
              <Header />
              <BlogPost />
              <Footer />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <NotificationProvider token={token} role="user">
                <Header />
                <Profile />
                <Footer />
              </NotificationProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <NotificationProvider token={token}>
                <AdminDashboard />
              </NotificationProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
