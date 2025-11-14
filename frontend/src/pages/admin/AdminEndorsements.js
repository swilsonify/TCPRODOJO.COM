import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Video } from 'lucide-react';

const AdminEndorsements = () => {
  const navigate = useNavigate();
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEndorsement, setEditingEndorsement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    description: '',
    displayOrder: 0
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadEndorsements();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadEndorsements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/endorsements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEndorsements(response.data);
    } catch (error) {
      console.error('Error loading endorsements:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    // Convert YouTube watch URL to embed URL if needed
    let embedUrl = formData.videoUrl;
    if (embedUrl.includes('youtube.com/watch')) {
      const videoId = embedUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const dataToSubmit = { ...formData, videoUrl: embedUrl };

    try {
      if (editingEndorsement) {
        await axios.put(`${API}/api/admin/endorsements/${editingEndorsement.id}`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/endorsements`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await loadEndorsements();
      resetForm();
    } catch (error) {
      console.error('Error saving endorsement:', error);
      alert('Error saving endorsement. Please try again.');
    }
  };

  const handleEdit = (endorsement) => {
    setEditingEndorsement(endorsement);
    setFormData({
      title: endorsement.title,
      videoUrl: endorsement.videoUrl,
      description: endorsement.description || '',
      displayOrder: endorsement.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (endorsementId) => {
    if (!window.confirm('Are you sure you want to delete this endorsement?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/endorsements/${endorsementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadEndorsements();
    } catch (error) {
      console.error('Error deleting endorsement:', error);
      alert('Error deleting endorsement. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      videoUrl: '',
      description: '',
      displayOrder: 0
    });
    setEditingEndorsement(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Manage TC Endorsements</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Add Endorsement</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingEndorsement ? 'Edit Endorsement' : 'Add New Endorsement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  placeholder="e.g., Kevin Owens, WWE Universal Champion"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">YouTube Video URL *</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Paste any YouTube URL format - it will be converted automatically
                </p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 h-20"
                  placeholder="Brief description of the endorsement..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  min="0"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  {editingEndorsement ? 'Update Endorsement' : 'Add Endorsement'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading endorsements...</div>
        ) : endorsements.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No endorsements yet. Click "Add Endorsement" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {endorsements.map((endorsement) => (
              <div
                key={endorsement.id}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
                  {endorsement.videoUrl ? (
                    <iframe
                      className="w-full h-full"
                      src={endorsement.videoUrl}
                      title={endorsement.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <Video className="text-blue-500" size={48} />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-sm flex-1">{endorsement.title}</h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEdit(endorsement)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(endorsement.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">{endorsement.description}</p>
                  <p className="text-gray-600 text-xs mt-2">Order: {endorsement.displayOrder}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEndorsements;
