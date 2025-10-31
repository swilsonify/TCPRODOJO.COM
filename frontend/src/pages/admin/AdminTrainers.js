import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    aka: '',
    title: '',
    specialty: '',
    experience: '',
    bio: '',
    achievements: [],
    photoUrl: '',
    videoUrl: ''
  });
  const [achievementInput, setAchievementInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    verifyAuth();
    loadTrainers();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadTrainers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API}/admin/trainers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainers(response.data);
    } catch (error) {
      console.error('Error loading trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      if (editingTrainer) {
        // Update existing trainer
        await axios.put(`${API}/admin/trainers/${editingTrainer.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new trainer
        await axios.post(`${API}/admin/trainers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      resetForm();
      loadTrainers();
    } catch (error) {
      console.error('Error saving trainer:', error);
      alert('Error saving trainer. Please try again.');
    }
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      aka: trainer.aka || '',
      title: trainer.title,
      specialty: trainer.specialty,
      experience: trainer.experience,
      bio: trainer.bio,
      achievements: trainer.achievements || [],
      photoUrl: trainer.photoUrl || '',
      videoUrl: trainer.videoUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (trainerId) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/admin/trainers/${trainerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadTrainers();
    } catch (error) {
      console.error('Error deleting trainer:', error);
      alert('Error deleting trainer. Please try again.');
    }
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, achievementInput.trim()]
      });
      setAchievementInput('');
    }
  };

  const removeAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      aka: '',
      title: '',
      specialty: '',
      experience: '',
      bio: '',
      achievements: [],
      photoUrl: '',
      videoUrl: ''
    });
    setAchievementInput('');
    setEditingTrainer(null);
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
              <h1 className="text-2xl font-bold text-white">Trainers Manager</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Plus size={18} />
              <span>Add Trainer</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Rodney Kellman"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Ring Name / AKA</label>
                  <input
                    type="text"
                    value={formData.aka}
                    onChange={(e) => setFormData({ ...formData, aka: e.target.value })}
                    placeholder='"The Master"'
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Head Coach & Founder"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Specialty *</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                    placeholder="Technical Wrestling & Ring Psychology"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Experience *</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                  placeholder="21 years"
                  className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  rows="4"
                  placeholder="Tell us about this trainer..."
                  className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Key Achievements</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                    placeholder="Add an achievement and press Enter"
                    className="flex-1 px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.achievements.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between bg-black border border-blue-500/20 rounded px-4 py-2">
                        <span className="text-white">{achievement}</span>
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Trainer Photo URL</label>
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
                  <label className="block text-white font-semibold mb-2">Training Video URL</label>
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
                  {editingTrainer ? 'Update Trainer' : 'Create Trainer'}
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

        {/* Trainers List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading trainers...</div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-400 text-lg">No trainers yet. Click "Add Trainer" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-gray-900 border border-blue-500/20 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {trainer.name}
                      {trainer.aka && <span className="text-blue-400 ml-2">"{trainer.aka}"</span>}
                    </h3>
                    <p className="text-blue-400 font-semibold mb-2">{trainer.title}</p>
                    <div className="text-gray-400 space-y-1">
                      <p><strong>Specialty:</strong> {trainer.specialty}</p>
                      <p><strong>Experience:</strong> {trainer.experience}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(trainer)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(trainer.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{trainer.bio}</p>
                {trainer.achievements && trainer.achievements.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Key Achievements:</h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      {trainer.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrainers;
