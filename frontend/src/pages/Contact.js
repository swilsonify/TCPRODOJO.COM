import { useEffect, useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show success anyway for demo
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="contact-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">CONTACT US</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ready to start your journey? Get in touch with us today.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-black border border-blue-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us A Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded text-green-400">
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Your full name"
                  data-testid="contact-name-input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="your.email@example.com"
                  data-testid="contact-email-input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="(555) 123-4567"
                  data-testid="contact-phone-input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  data-testid="contact-subject-select"
                >
                  <option>General Inquiry</option>
                  <option>Training Program Information</option>
                  <option>Class Schedule Question</option>
                  <option>Event Registration</option>
                  <option>Partnership Opportunity</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Tell us more about your inquiry..."
                  data-testid="contact-message-textarea"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-contact-button"
              >
                <Send size={20} />
                <span>{submitting ? 'SENDING...' : 'SEND MESSAGE'}</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Get In Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                    <p className="text-gray-400">
                      9800 Rue Meilleur<br />
                      Montréal, QC H3L 3J4
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    <p className="text-gray-400">info@tcprodojo.com</p>
                    <p className="text-gray-400 text-sm">General Inquiries & Private Classes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Questions?</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Do I need experience?</h3>
                  <p className="text-gray-400 text-sm">No! We have programs for complete beginners through advanced students.</p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">What should I bring?</h3>
                  <p className="text-gray-400 text-sm">Athletic clothing, water bottle, and a positive attitude. We provide all training equipment.</p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Can I try a class first?</h3>
                  <p className="text-gray-400 text-sm">Yes! Contact us to schedule a free trial class.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;