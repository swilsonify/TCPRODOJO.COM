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
      const [upcomingRes, pastRes] = await Promise.all([
        axios.get(`${API}/api/events`),
        axios.get(`${API}/api/past-events`)
      ]);
      
      setUpcomingEvents(upcomingRes.data);
      setPastEvents(pastRes.data);
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
            <div className="space-y-8">
              {upcomingEvents.map((event) => {
                const hasMedia = event.posterUrl || event.promoVideoUrl;
                
                return (
              <div
                key={event.id}
                className="bg-black border border-blue-500/20 rounded-lg overflow-hidden hover-lift"
                data-testid={`event-${event.id}`}
              >
                {hasMedia ? (
                  // Two-column layout when poster or video exists
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side - Poster & Video */}
                    <div className="space-y-4 p-6">
                      {/* Event Poster */}
                      {event.posterUrl && (
                        <div className="rounded-lg overflow-hidden border-2 border-blue-500">
                          <img 
                            src={event.posterUrl} 
                            alt={event.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Promotional Video */}
                      {event.promoVideoUrl && (
                        <div className="aspect-video bg-gradient-to-br from-blue-900 to-black rounded-lg overflow-hidden border-2 border-blue-500">
                          <iframe
                            className="w-full h-full"
                            src={event.promoVideoUrl}
                            title={`${event.title} Promo`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Event Details */}
                    <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">{event.title}</h3>
                      
                      <div className="flex flex-wrap gap-4 text-gray-400 mb-6">
                        <div className="flex items-center space-x-2">
                          <Calendar size={18} />
                          <span className="font-semibold">{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={18} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin size={18} />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 leading-relaxed">{event.description}</p>

                      <div className="flex items-center space-x-2 text-gray-400 mb-6">
                        <Users size={18} />
                        <span>{event.attendees} expected attendees</span>
                      </div>
                    </div>

                    {event.ticketLink && (
                      <a
                        href={event.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded transition-colors text-center block"
                        data-testid={`buy-tickets-${event.id}-button`}
                      >
                        BUY TICKETS
                      </a>
                    )}
                  </div>
                </div>
                ) : (
                  // Single column layout when no media
                  <div className="p-6">
                    <h3 className="text-3xl font-bold text-white mb-4">{event.title}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-gray-400 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar size={18} />
                        <span className="font-semibold">{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={18} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={18} />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 leading-relaxed">{event.description}</p>

                    <div className="flex items-center space-x-2 text-gray-400 mb-6">
                      <Users size={18} />
                      <span>{event.attendees} expected attendees</span>
                    </div>

                    {event.ticketLink && (
                      <a
                        href={event.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded transition-colors text-center"
                        data-testid={`buy-tickets-${event.id}-button`}
                      >
                        BUY TICKETS
                      </a>
                    )}
                  </div>
                )}
              </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white torture-text mb-8">PAST EVENTS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden hover-lift"
                  data-testid={`past-event-${index}`}
                >
                  {/* Video/Poster - Square Frame */}
                  <div className="aspect-square bg-gradient-to-br from-blue-900 to-black flex items-center justify-center border-4 border-blue-500">
                    {event.promoVideoUrl ? (
                      <iframe
                        className="w-full h-full"
                        src={event.promoVideoUrl}
                        title={event.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : event.posterUrl ? (
                      <img 
                        src={event.posterUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <Calendar className="w-16 h-16 mx-auto mb-2 text-blue-500" />
                        <span className="text-gray-500 text-sm">Event Archive</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="text-blue-400 text-sm font-semibold mb-2">{event.date}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                    {event.location && (
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
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