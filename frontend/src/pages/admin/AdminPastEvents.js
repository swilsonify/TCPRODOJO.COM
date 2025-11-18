import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPastEvents = () => {
  const navigate = useNavigate();
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    posterUrl: '',
    youtubeUrl: '',
    description: '',
    displayOrder: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadPastEvents();
  }, [navigate]);

  const loadPastEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/admin/past-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPastEvents(response.data);
    } catch (error) {
      console.error('Error loading past events:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingEvent) {
        await axios.put(`${API}/admin/past-events/${editingEvent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/past-events`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      loadPastEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving past event:', error);
      alert('Failed to save past event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      posterUrl: event.posterUrl || '',
      youtubeUrl: event.youtubeUrl || '',
      description: event.description,
      displayOrder: event.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this past event?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/admin/past-events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadPastEvents();
    } catch (error) {
      console.error('Error deleting past event:', error);
      alert('Failed to delete past event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      posterUrl: '',
      youtubeUrl: '',
      description: '',
      displayOrder: 0
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-blue-500/10 rounded transition-colors"
            >
              <ArrowLeft className="text-blue-400" size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Calendar className="text-blue-400" size={32} />
                Past Events Manager
              </h1>
              <p className="text-gray-400 mt-1">Manage event archives and history</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
          >
            <Plus size={20} />
            Add Past Event
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingEvent ? 'Edit Past Event' : 'Add New Past Event'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summer Championship 2024"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Event Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="June 15, 2024"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Event Poster URL</label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="https://i.imgur.com/poster.jpg"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Upload image to Imgur/Cloudinary and paste URL</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">YouTube Video URL</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Embed URL for event highlights video</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="An unforgettable night of wrestling action..."
                    rows="4"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors flex items-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors flex items-center gap-2"
                >
                  <Save size={20} />
                  {editingEvent ? 'Update' : 'Create'} Past Event
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Past Events List */}
        <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Past Events Archive ({pastEvents.length})
          </h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No past events yet. Click "Add Past Event" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-black border border-blue-500/20 rounded-lg p-4 flex items-start justify-between hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-blue-400 text-sm mb-2">{event.date}</p>
                    <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                    {event.posterUrl && (
                      <span className="text-green-400 text-xs">📷 Poster</span>
                    )}
                    {event.youtubeUrl && (
                      <span className="text-red-400 text-xs ml-3">🎥 Video</span>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPastEvents;
