import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

const AdminSuccessStories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    promotion: '',
    achievement: '',
    yearGraduated: '',
    bio: '',
    photo_url: '',
    displayOrder: 0
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadStories();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadStories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/success-stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStories(response.data);
    } catch (error) {
      console.error('Error loading success stories:', error);
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

    try {
      if (editingStory) {
        await axios.put(`${API}/api/admin/success-stories/${editingStory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/success-stories`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await loadStories();
      resetForm();
    } catch (error) {
      console.error('Error saving success story:', error);
      alert('Error saving success story. Please try again.');
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      name: story.name,
      promotion: story.promotion,
      achievement: story.achievement,
      yearGraduated: story.yearGraduated,
      bio: story.bio,
      photo_url: story.photo_url || '',
      displayOrder: story.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this success story?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/success-stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadStories();
    } catch (error) {
      console.error('Error deleting success story:', error);
      alert('Error deleting success story. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      promotion: '',
      achievement: '',
      yearGraduated: '',
      bio: '',
      photo_url: '',
      displayOrder: 0
    });
    setEditingStory(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Manage Success Stories</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Add Success Story</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingStory ? 'Edit Success Story' : 'Add New Success Story'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Graduate Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder='e.g., Alex "The Apex" Martinez'
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Year Graduated *</label>
                  <input
                    type="text"
                    value={formData.yearGraduated}
                    onChange={(e) => setFormData({ ...formData, yearGraduated: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., 2018"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Promotion/Organization *</label>
                  <input
                    type="text"
                    value={formData.promotion}
                    onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., Major League Wrestling"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Achievement *</label>
                  <input
                    type="text"
                    value={formData.achievement}
                    onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., MLW Champion 2023"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 h-24"
                  placeholder="Write their success story..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Photo URL</label>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="https://example.com/photo.jpg"
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
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  {editingStory ? 'Update Story' : 'Add Story'}
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
          <div className="text-center text-gray-400 py-8">Loading success stories...</div>
        ) : stories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No success stories yet. Click "Add Success Story" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-gray-500">Class of {story.yearGraduated}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(story)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{story.name}</h3>
                <p className="text-blue-400 text-sm font-semibold mb-1">{story.promotion}</p>
                <p className="text-gray-400 text-sm mb-3">{story.achievement}</p>
                <p className="text-gray-300 text-sm">{story.bio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSuccessStories;
