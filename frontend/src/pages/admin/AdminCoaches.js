import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

const AdminCoaches = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    aka: '',
    title: '',
    specialty: '',
    experience: '',
    bio: '',
    achievements: ['', '', '', ''],
    photo_url: '',
    displayOrder: 0
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadCoaches();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/coaches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoaches(response.data);
    } catch (error) {
      console.error('Error loading coaches:', error);
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
      if (editingCoach) {
        await axios.put(`${API}/api/admin/coaches/${editingCoach.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/coaches`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await loadCoaches();
      resetForm();
    } catch (error) {
      console.error('Error saving coach:', error);
      alert('Error saving coach. Please try again.');
    }
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      aka: coach.aka || '',
      title: coach.title,
      specialty: coach.specialty,
      experience: coach.experience,
      bio: coach.bio,
      achievements: coach.achievements || ['', '', '', ''],
      photo_url: coach.photo_url || '',
      displayOrder: coach.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (coachId) => {
    if (!window.confirm('Are you sure you want to delete this coach?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/coaches/${coachId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadCoaches();
    } catch (error) {
      console.error('Error deleting coach:', error);
      alert('Error deleting coach. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      aka: '',
      title: '',
      specialty: '',
      experience: '',
      bio: '',
      achievements: ['', '', '', ''],
      photo_url: '',
      displayOrder: 0
    });
    setEditingCoach(null);
    setShowForm(false);
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Manage Coaches</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Add Coach</span>
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCoach ? 'Edit Coach' : 'Add New Coach'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">AKA / Ring Name</label>
                  <input
                    type="text"
                    value={formData.aka}
                    onChange={(e) => setFormData({ ...formData, aka: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., Soa Amin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., Head Coach & Founder"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Experience *</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., 20+ years"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Specialty *</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  placeholder="e.g., All Aspects of Pro Wrestling"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 h-32"
                  placeholder="Write the coach's biography here..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Achievements (4 items)</label>
                {formData.achievements.map((achievement, index) => (
                  <input
                    key={index}
                    type="text"
                    value={achievement}
                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2 mb-2"
                    placeholder={`Achievement ${index + 1}`}
                  />
                ))}
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
                  {editingCoach ? 'Update Coach' : 'Add Coach'}
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

        {/* Coaches List */}
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading coaches...</div>
        ) : coaches.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No coaches yet. Click "Add Coach" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-gray-800 rounded-lg p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{coach.name}</h3>
                  {coach.aka && (
                    <p className="text-blue-400 text-sm mb-1">aka {coach.aka}</p>
                  )}
                  <p className="text-blue-400 font-semibold mb-1">{coach.title}</p>
                  <p className="text-gray-400 text-sm mb-2">
                    <span className="font-semibold">Specialty:</span> {coach.specialty} | {coach.experience}
                  </p>
                  <p className="text-gray-300 text-sm mb-3">{coach.bio}</p>
                  {coach.achievements && coach.achievements.length > 0 && (
                    <div className="text-gray-400 text-sm">
                      <strong>Achievements:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {coach.achievements.filter(a => a).map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(coach)}
                    className="text-blue-400 hover:text-blue-300 p-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(coach.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoaches;
