import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';

const AdminClassSchedule = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '',
    title: '',
    instructor: '',
    level: 'Beginner',
    spots: 10,
    type: 'Wrestling',
    description: ''
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadClasses();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      
      if (editingClass) {
        await axios.put(`${API}/api/admin/classes/${editingClass.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/classes`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      loadClasses();
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Error saving class. Please try again.');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      day: classItem.day,
      time: classItem.time,
      title: classItem.title,
      instructor: classItem.instructor,
      level: classItem.level,
      spots: classItem.spots,
      type: classItem.type,
      description: classItem.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/api/admin/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      day: 'Monday',
      time: '',
      title: '',
      instructor: '',
      level: 'Beginner',
      spots: 10,
      type: 'Wrestling',
      description: ''
    });
    setEditingClass(null);
    setShowForm(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const types = ['Wrestling', 'Boxing', 'Fitness'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4 p-2 hover:bg-blue-500/10 rounded transition-colors"
            >
              <ArrowLeft className="text-blue-500" size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white torture-text">Class Schedule Manager</h1>
              <p className="text-gray-400 mt-2">Manage weekly class schedule</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Class
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-black border border-blue-500/20 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="6:00 PM - 8:00 PM"
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Class Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Beginner Pro Wrestling"
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Coach Mike"
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Available Spots</label>
                  <input
                    type="number"
                    value={formData.spots}
                    onChange={(e) => setFormData({ ...formData, spots: parseInt(e.target.value) })}
                    min="1"
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional class details..."
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Current Classes ({classes.length})</h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No classes added yet. Click "Add Class" to create one.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/20 rounded-lg p-6 hover-lift"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{classItem.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        classItem.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        classItem.level === 'Advanced' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {classItem.level}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-300">
                      {classItem.type}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-gray-300">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-blue-400" />
                      <span>{classItem.day}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-blue-400" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="text-sm">
                      <strong>Instructor:</strong> {classItem.instructor}
                    </div>
                    <div className="text-sm">
                      <strong>Spots:</strong> {classItem.spots}
                    </div>
                    {classItem.description && (
                      <div className="text-sm text-gray-400 mt-2">
                        {classItem.description}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
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

export default AdminClassSchedule;
