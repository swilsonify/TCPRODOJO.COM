import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API}/api/events`);
      const allEvents = response.data;
      
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Separate events into upcoming and past
      const upcoming = [];
      const past = [];
      
      allEvents.forEach(event => {
        // Parse event date (format: "February 15, 2025" or "2025-02-15")
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate >= today) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      });
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error('Error loading events:', error);
      setUpcomingEvents([]);
      setPastEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/api/newsletter/subscribe?email=${encodeURIComponent(newsletterEmail)}`);
      setSubscribeMessage('✅ Successfully subscribed to our newsletter!');
      setNewsletterEmail('');
      setTimeout(() => setSubscribeMessage(''), 5000);
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscribeMessage('❌ Error subscribing. Please try again.');
      setTimeout(() => setSubscribeMessage(''), 5000);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="events-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">EVENTS</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join us for showcases, workshops, and special events. Be part of the Torture Chamber community.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white torture-text mb-8">UPCOMING EVENTS</h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading events...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No upcoming events at this time.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for announcements!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-black border border-blue-500/20 rounded-lg p-6 hover-lift"
                data-testid={`event-${event.id}`}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{event.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>{event.attendees} expected</span>
                    </div>
                  </div>
                  <Link
                    to={event.ticketLink}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors text-center"
                    data-testid={`buy-tickets-${event.id}-button`}
                  >
                    BUY TICKETS
                  </Link>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white torture-text mb-8">PAST EVENTS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-6"
                  data-testid={`past-event-${index}`}
                >
                  <div className="text-blue-400 text-sm font-semibold mb-2">{event.date}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                  <p className="text-gray-400 text-sm">{event.description}</p>
                  {event.location && (
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mt-2">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-6">
            Don't miss out on our events. Get added to our mailing list.
          </p>
          
          <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                data-testid="newsletter-email-input"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-blue-600 font-bold rounded hover:bg-gray-100 transition-colors"
                data-testid="subscribe-button"
              >
                Subscribe
              </button>
            </div>
            {subscribeMessage && (
              <p className="mt-4 text-white font-semibold">{subscribeMessage}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Events;