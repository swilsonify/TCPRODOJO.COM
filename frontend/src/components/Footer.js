import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-blue-500/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
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
                <div className="text-white font-bold text-xl tracking-wide torture-text">TORTURE CHAMBER</div>
                <div className="text-xs text-blue-400 font-semibold">PRO WRESTLING DOJO</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Built for Champions.<br />
              Since 2004, we've been forging the next generation of professional wrestling talent.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/tcprodojo/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-blue-500 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                data-testid="instagram-link"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/tcprodojo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-blue-500 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                data-testid="facebook-link"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm tracking-wider">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li><Link to="/classes" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Class Schedule</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Upcoming Events</Link></li>
              <li><Link to="/pros" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Our Trainers</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm tracking-wider">CONTACT</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-gray-400 text-sm">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>9800 Rue Meilleur<br />Montréal, QC H3L 3J4</span>
              </li>
              <li>
                <div className="flex items-start space-x-2 text-gray-400 text-sm">
                  <Mail size={16} />
                  <div>
                    <div>info@tcprodojo.com</div>
                    <div className="text-xs text-gray-500">General Inquiries</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-500/20 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Torture Chamber Pro Wrestling Dojo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;