import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'TRAINING', path: '/training' },
    { name: 'CLASSES', path: '/classes' },
    { name: 'EVENTS', path: '/events' },
    { name: 'SUCCESS', path: '/success' },
    { name: 'SHOP', path: '/shop' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/images/circle-logo.jpg" 
              alt="Torture Chamber Logo" 
              className="w-16 h-16 rounded-full object-cover"
              style={{ 
                aspectRatio: '1/1',
                mixBlendMode: 'lighten',
                opacity: 0.95
              }}
            />
            <div>
              <div className="text-xs text-blue-400 font-semibold tracking-wider">TRAIN LIKE A CHAMPION</div>
              <div className="text-white font-bold text-lg tracking-wide torture-text">TORTURE CHAMBER</div>
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