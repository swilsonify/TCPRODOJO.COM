import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Users, Trophy, MessageSquare, LogOut, LayoutDashboard, Image, Video, Mail } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState({
    events: 0,
    testimonials: 0,
    contacts: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('adminToken');
    const storedUsername = localStorage.getItem('adminUsername');

    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsername(storedUsername);
      loadStats();
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
      navigate('/admin/login');
    }
  };

  const loadStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const [events, testimonials, contacts, coaches, successStories, endorsements, tips, classes, newsletter, pastEventsArchive] = await Promise.all([
        axios.get(`${API}/admin/events`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/testimonials`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/contacts`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/coaches`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/success-stories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/endorsements`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/tips`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/classes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/newsletter-subscriptions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/past-events`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Separate events into upcoming and past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingEvents = events.data.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });
      
      const pastEvents = events.data.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
      });

      setStats({
        events: events.data.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        pastEventsArchive: pastEventsArchive.data.length,
        testimonials: testimonials.data.length,
        contacts: contacts.data.length,
        coaches: coaches.data.length,
        success_stories: successStories.data.length,
        endorsements: endorsements.data.length,
        tips: tips.data.length,
        classes: classes.data.length,
        newsletter: newsletter.data.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const adminSections = [
    {
      title: 'Upcoming Events',
      icon: Calendar,
      count: stats.upcomingEvents || 0,
      link: '/admin/events',
      description: 'Manage future events and tickets'
    },
    {
      title: 'Past Events Archive',
      icon: Calendar,
      count: stats.pastEventsArchive || 0,
      link: '/admin/past-events',
      description: 'Manage event history and archives'
    },
    {
      title: 'Testimonials',
      icon: MessageSquare,
      count: stats.testimonials,
      link: '/admin/testimonials',
      description: 'Manage student testimonials'
    },
    {
      title: 'Contact Messages',
      icon: Trophy,
      count: stats.contacts,
      link: '/admin/contacts',
      description: 'View contact form submissions'
    },
    {
      title: 'Coaches',
      icon: Users,
      count: stats.coaches || 0,
      link: '/admin/coaches',
      description: 'Manage SUCCESS page coaches'
    },
    {
      title: 'Success Stories',
      icon: Trophy,
      count: stats.success_stories || 0,
      link: '/admin/success-stories',
      description: 'Manage graduate success stories'
    },
    {
      title: 'TC Endorsements',
      icon: Video,
      count: stats.endorsements || 0,
      link: '/admin/endorsements',
      description: 'Manage endorsement videos'
    },
    {
      title: 'Tips & Techniques',
      icon: Video,
      count: stats.tips || 0,
      link: '/admin/tips',
      description: 'Manage training tips videos'
    },
    {
      title: 'Class Schedule',
      icon: Calendar,
      count: stats.classes || 0,
      link: '/admin/classes',
      description: 'Manage weekly class schedule'
    },
    {
      title: 'Newsletter Subscribers',
      icon: Mail,
      count: stats.newsletter || 0,
      link: '/admin/newsletter',
      description: 'View and download email list'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/circle-logo.jpg" 
                alt="TC Pro Dojo" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-white">TC Pro Dojo Admin</h1>
                <p className="text-sm text-gray-400">Welcome, {username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white torture-text mb-4">ADMIN DASHBOARD</h2>
          <p className="text-gray-400">Manage your website content</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminSections.map((section, index) => (
              <Link
                key={index}
                to={section.link}
                className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <section.icon size={24} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold text-blue-400">{section.count}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-400 text-sm">{section.description}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/events"
              className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500 transition-colors text-center"
            >
              <Calendar className="text-blue-400 mx-auto mb-3" size={32} />
              <div className="text-white font-semibold">Add New Event</div>
            </Link>
            <Link
              to="/admin/testimonials"
              className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500 transition-colors text-center"
            >
              <MessageSquare className="text-blue-400 mx-auto mb-3" size={32} />
              <div className="text-white font-semibold">Add Testimonial</div>
            </Link>
            <Link
              to="/admin/events"
              className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500 transition-colors text-center"
            >
              <Calendar className="text-blue-400 mx-auto mb-3" size={32} />
              <div className="text-white font-semibold">Add Event</div>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300"
          >
            <LayoutDashboard size={18} />
            <span>View Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;