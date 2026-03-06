import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, CalendarDays, Repeat, Mail, Eye } from 'lucide-react';

const AdminClassSchedule = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState({ cancelled: '', rescheduled: '' });
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    schedule: [{ day: 'Monday', time: '' }],
    title: '',
    instructor: '',
    level: 'Beginner',
    spots: 10,
    type: 'Wrestling',
    description: '',
    is_one_time: false,
    one_time_date: '',
    time: ''
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
      const payload = {
        ...formData,
        // Backward compat: set day/days/time from schedule
        day: formData.schedule.length > 0 ? formData.schedule[0].day : '',
        days: formData.schedule.map(s => s.day),
        time: formData.is_one_time ? formData.time : (formData.schedule.length > 0 ? formData.schedule[0].time : ''),
        schedule: formData.schedule
      };
      
      if (editingClass) {
        await axios.put(`${API}/api/admin/classes/${editingClass.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/classes`, payload, {
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
    // Build schedule from existing data
    let schedule;
    if (classItem.schedule && classItem.schedule.length > 0) {
      schedule = classItem.schedule;
    } else if (classItem.days && classItem.days.length > 0) {
      schedule = classItem.days.map(d => ({ day: d, time: classItem.time || '' }));
    } else {
      schedule = [{ day: classItem.day || 'Monday', time: classItem.time || '' }];
    }
    setFormData({
      schedule,
      title: classItem.title,
      instructor: classItem.instructor,
      level: classItem.level,
      spots: classItem.spots,
      type: classItem.type,
      description: classItem.description || '',
      is_one_time: classItem.is_one_time || false,
      one_time_date: classItem.one_time_date || '',
      time: classItem.time || ''
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
      schedule: [{ day: 'Monday', time: '' }],
      title: '',
      instructor: '',
      level: 'Beginner',
      spots: 10,
      type: 'Wrestling',
      description: '',
      is_one_time: false,
      one_time_date: '',
      time: ''
    });
    setEditingClass(null);
    setShowForm(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const types = ['Wrestling', 'Boxing', 'Fitness'];

  const loadEmailPreviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const sampleClassId = classes.length > 0 ? classes[0].id : '';
      const [cancelledRes, rescheduledRes] = await Promise.all([
        axios.post(`${API}/api/admin/classes/email-preview`, {
          class_id: sampleClassId, status: 'cancelled', date: 'Monday, March 10, 2026', reason: 'Coach unavailable'
        }, { headers }),
        axios.post(`${API}/api/admin/classes/email-preview`, {
          class_id: sampleClassId, status: 'rescheduled', date: 'Wednesday, March 12, 2026',
          reason: 'Venue change', rescheduled_time: '8:00 PM - 10:00 PM'
        }, { headers })
      ]);
      setEmailPreviewHtml({
        cancelled: cancelledRes.data.html,
        rescheduled: rescheduledRes.data.html,
        studentCount: cancelledRes.data.student_count
      });
      setShowEmailPreview(true);
    } catch (error) {
      console.error('Error loading email preview:', error);
      alert('Failed to load email preview.');
    }
  };

  // Separate recurring and one-time classes
  const recurringClasses = classes.filter(c => !c.is_one_time);
  const oneTimeClasses = classes.filter(c => c.is_one_time);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

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
          <button
            onClick={loadEmailPreviews}
            className="flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors ml-3"
            data-testid="email-preview-btn"
          >
            <Mail size={18} className="mr-2" />
            <Eye size={16} className="mr-1" />
            Email Preview
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-black border border-blue-500/20 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Class Type Toggle */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Class Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_one_time: false, one_time_date: '' })}
                    className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                      !formData.is_one_time 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Repeat size={18} className="mr-2" />
                    Recurring Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_one_time: true, day: '' })}
                    className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                      formData.is_one_time 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <CalendarDays size={18} className="mr-2" />
                    One-Time Special
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Day or Date selection based on class type */}
                {formData.is_one_time ? (
                  <>
                    <div>
                      <label className="block text-white font-semibold mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.one_time_date}
                        onChange={(e) => setFormData({ ...formData, one_time_date: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-gray-900 border border-purple-500/40 rounded text-white focus:outline-none focus:border-purple-500"
                      />
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
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-white font-semibold mb-2">Schedule (Day & Time)</label>
                    <div className="space-y-3">
                      {formData.schedule.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <select
                            value={entry.day}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[idx] = { ...entry, day: e.target.value };
                              setFormData({ ...formData, schedule: newSchedule });
                            }}
                            className="px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={entry.time}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[idx] = { ...entry, time: e.target.value };
                              setFormData({ ...formData, schedule: newSchedule });
                            }}
                            placeholder="6:00 PM - 8:00 PM"
                            className="flex-1 px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                          {formData.schedule.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newSchedule = formData.schedule.filter((_, i) => i !== idx);
                                setFormData({ ...formData, schedule: newSchedule });
                              }}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, schedule: [...formData.schedule, { day: 'Monday', time: '' }] })}
                        className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                      >
                        + Add another day
                      </button>
                    </div>
                  </div>
                )}

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
        <div className="bg-black border border-blue-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Repeat size={24} className="mr-3 text-blue-400" />
            Recurring Weekly Classes ({recurringClasses.length})
          </h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading classes...</div>
          ) : recurringClasses.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No recurring classes added yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recurringClasses.map((classItem) => (
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
                      <span>
                        {classItem.schedule && classItem.schedule.length > 0
                          ? classItem.schedule.map(s => `${s.day} @ ${s.time}`).join(' | ')
                          : classItem.days && classItem.days.length > 0
                            ? classItem.days.join(', ')
                            : classItem.day
                        }
                      </span>
                    </div>
                    {classItem.schedule && classItem.schedule.length > 0 ? null : (
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-blue-400" />
                        <span>{classItem.time}</span>
                      </div>
                    )}
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

        {/* One-Time Special Classes */}
        <div className="bg-black border border-purple-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CalendarDays size={24} className="mr-3 text-purple-400" />
            One-Time Special Classes ({oneTimeClasses.length})
          </h2>
          
          {oneTimeClasses.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No one-time special classes scheduled. Click "Add Class" and select "One-Time Special" to create one.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oneTimeClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-lg p-6 hover-lift"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 mb-2 inline-block">
                        SPECIAL CLASS
                      </span>
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
                      <CalendarDays size={16} className="mr-2 text-purple-400" />
                      <span className="text-purple-300 font-semibold">{formatDate(classItem.one_time_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-purple-400" />
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
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
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

        {/* Email Preview Modal */}
        {showEmailPreview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" data-testid="email-preview-modal">
            <div className="bg-gray-900 border border-blue-500/20 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mail size={20} className="text-blue-400" />
                    Class Notification Email Preview
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    These emails are automatically sent to enrolled students when a class is cancelled or rescheduled.
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="text-gray-400 hover:text-white text-2xl px-2"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-red-400 text-center mb-3 tracking-wide">CANCELLATION EMAIL</p>
                  <div
                    className="border border-gray-700 rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: emailPreviewHtml.cancelled }}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-400 text-center mb-3 tracking-wide">RESCHEDULE EMAIL</p>
                  <div
                    className="border border-gray-700 rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: emailPreviewHtml.rescheduled }}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 text-center">
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClassSchedule;
