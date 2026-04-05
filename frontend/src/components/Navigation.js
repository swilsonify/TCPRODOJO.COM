import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadSiteSettings();
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const saved = localStorage.getItem('tcprodojo_cart');
        const cart = saved ? JSON.parse(saved) : [];
        const count = cart.reduce((sum, i) => sum + i.quantity, 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const loadSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/api/site-settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const handleCartClick = () => {
    if (location.pathname === '/shop') {
      window.dispatchEvent(new Event('open-cart'));
    } else {
      navigate('/shop?cart=open');
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('tcprodojo_lang', newLang);
    setCurrentLang(newLang);
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.training'), path: '/training' },
    { name: t('nav.classes'), path: '/classes' },
    { name: t('nav.events'), path: '/events' },
    { name: t('nav.success'), path: '/success' },
    { name: t('nav.media'), path: '/media' },
    { name: t('nav.shop'), path: '/shop' },
  ];

  const isActive = (path) => location.pathname === path;

  const circleLogo = siteSettings.circle_logo || '/images/circle-logo.jpg';
  const navTagline = siteSettings.nav_tagline || 'TRAIN LIKE A CHAMPION';
  const navTitle = siteSettings.nav_title || 'TORTURE CHAMBER';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={circleLogo}
              alt="Torture Chamber Logo"
              className="w-16 h-16 rounded-full object-cover"
              style={{
                aspectRatio: '1/1',
                mixBlendMode: 'lighten',
                opacity: 0.95
              }}
            />
            <div>
              <div className="text-xs text-blue-400 font-semibold tracking-wider">{navTagline}</div>
              <div className="text-white font-bold text-lg tracking-wide torture-text">{navTitle}</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wider transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-500'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Cart Icon */}
            <button
              onClick={handleCartClick}
              className="relative text-gray-300 hover:text-blue-400 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-sm font-bold tracking-wider text-gray-300 hover:text-blue-400 transition-colors border border-gray-700 hover:border-blue-400 rounded px-2 py-1"
              aria-label="Toggle language"
            >
              <span className={currentLang === 'en' ? 'text-blue-400' : 'text-gray-500'}>FR</span>
              <span className="text-gray-600">|</span>
              <span className={currentLang === 'fr' ? 'text-blue-400' : 'text-gray-500'}>EN</span>
            </button>

            <Link
              to="/contact"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
              data-testid="contact-nav-button"
            >
              {t('nav.contact')}
            </Link>
          </div>

          {/* Mobile: Lang + Cart + Menu */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-xs font-bold text-gray-300 hover:text-blue-400 border border-gray-700 rounded px-2 py-1"
            >
              <span className={currentLang === 'en' ? 'text-blue-400' : 'text-gray-500'}>FR</span>
              <span className="text-gray-600">|</span>
              <span className={currentLang === 'fr' ? 'text-blue-400' : 'text-gray-500'}>EN</span>
            </button>

            <button
              onClick={handleCartClick}
              className="relative text-gray-300 hover:text-blue-400 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2"
              data-testid="mobile-menu-button"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-blue-500/20" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-sm font-semibold tracking-wider ${
                  isActive(link.path)
                    ? 'text-blue-500'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-center transition-colors"
            >
              {t('nav.contact')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
