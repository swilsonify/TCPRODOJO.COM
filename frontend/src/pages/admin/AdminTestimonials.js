import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    photoUrl: '',
    videoUrl: '',
    displayOrder: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    verifyAuth();
    loadTestimonials();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadTestimonials = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API}/admin/testimonials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      if (editingTestimonial) {
        // Update existing testimonial
        await axios.put(`${API}/admin/testimonials/${editingTestimonial.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new testimonial
        await axios.post(`${API}/admin/testimonials`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      resetForm();
      loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Error saving testimonial. Please try again.');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      photoUrl: testimonial.photoUrl || '',
      videoUrl: testimonial.videoUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/admin/testimonials/${testimonialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Error deleting testimonial. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      text: '',
      photoUrl: '',
      videoUrl: ''
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold text-white">Testimonials Manager</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Plus size={18} />
              <span>Add Testimonial</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Role / Description *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    placeholder="Pro Wrestling Student"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Testimonial Text *</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  rows="5"
                  placeholder="Share their experience at TC Pro Dojo..."
                  className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Person Photo URL</label>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://i.imgur.com/example.jpg"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Upload to Imgur and paste URL here</p>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Video Testimonial URL</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">YouTube or Vimeo URL</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                >
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-400 text-lg">No testimonials yet. Click "Add Testimonial" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-900 border border-blue-500/20 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{testimonial.name}</h3>
                    <p className="text-blue-400 text-sm">{testimonial.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
