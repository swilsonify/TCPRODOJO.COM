import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import axios from 'axios';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});
  const location = useLocation();

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/api/site-settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'TRAINING', path: '/training' },
    { name: 'CLASSES', path: '/classes' },
    { name: 'EVENTS', path: '/events' },
    { name: 'SUCCESS', path: '/success' },
    { name: 'MEDIA', path: '/media' },
    { name: 'SHOP', path: '/shop' },
  ];

  const isActive = (path) => location.pathname === path;

  // Use site settings if available, otherwise fallback to defaults
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
            <Link
              to="/contact"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
              data-testid="contact-nav-button"
            >
              CONTACT
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            data-testid="mobile-menu-button"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
              CONTACT
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;