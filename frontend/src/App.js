
import Header from './components/Header';
import Main from './components/Main';
import About from './components/About';
import PricingSection from './components/PricingSection';
import BlogIntro from './components/BlogIntro';
import Contacts from './components/Contacts';
import Consultation from './components/Consultation';
import HomeGalleryPreview from './components/HomeGalleryPreview';
import Footer from './components/Footer';
import './App.css';
function App() {
  return (
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
  );
}

export default App;
