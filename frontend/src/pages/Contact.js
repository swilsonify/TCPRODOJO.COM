import { useEffect, useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const response = await axios.get(`${API}/faqs`);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="contact-page">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">{t('contact.title')}</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-black border border-blue-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t('contact.form_title')}</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded text-green-400">
                {t('contact.success_message')}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">{t('contact.name_label')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder={t('contact.name_placeholder')}
                  data-testid="contact-name-input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">{t('contact.email_label')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder={t('contact.email_placeholder')}
                  data-testid="contact-email-input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">{t('contact.phone_label')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder={t('contact.phone_placeholder')}
                  data-testid="contact-phone-input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">{t('contact.subject_label')}</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  data-testid="contact-subject-select"
                >
                  <option>{t('contact.subject_general')}</option>
                  <option>{t('contact.subject_training')}</option>
                  <option>{t('contact.subject_schedule')}</option>
                  <option>{t('contact.subject_event')}</option>
                  <option>{t('contact.subject_partner')}</option>
                  <option>{t('contact.subject_other')}</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">{t('contact.message_label')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder={t('contact.message_placeholder')}
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
                <span>{submitting ? t('contact.sending_button') : t('contact.send_button')}</span>
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('contact.get_in_touch')}</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t('contact.visit_title')}</h3>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=9800+Rue+Meilleur+Suite+200+Montreal+QC+H3L+3J4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      9800 Rue Meilleur, Suite 200<br />
                      Montréal, QC H3L 3J4
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t('contact.email_title')}</h3>
                    <p className="text-gray-400">info@tcprodojo.com</p>
                    <p className="text-gray-400 text-sm">{t('contact.email_note')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('contact.faq_title')}</h2>
              <div className="space-y-4">
                {faqs.length > 0 ? (
                  faqs.map((faq) => (
                    <div key={faq.id}>
                      <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                      <p className="text-gray-400 text-sm">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Do I need experience?</h3>
                      <p className="text-gray-400 text-sm">No! We have programs for complete beginners through advanced students.</p>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">What should I bring?</h3>
                      <p className="text-gray-400 text-sm">Athletic clothing, water bottle, and a positive attitude. Once you join the school a TCPW uniform is required.</p>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Can I try a class first?</h3>
                      <p className="text-gray-400 text-sm">Yes! Contact us to schedule a trial class for $50. When you join up, this is credited to your membership fee.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
