import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Download, Mail, User, Phone, Bell, BellOff, Copy } from 'lucide-react';

const AdminStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    classes: [],
    notes: '',
    active: true,
    notify_class_changes: true
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadData();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/api/admin/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
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
      if (editingStudent) {
        await axios.put(`${API}/api/admin/students/${editingStudent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/students`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.response?.data?.detail || 'Error saving student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      classes: student.classes || [],
      notes: student.notes || '',
      active: student.active !== false,
      notify_class_changes: student.notify_class_changes !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      classes: [],
      notes: '',
      active: true,
      notify_class_changes: true
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter(id => id !== classId)
        : [...prev.classes, classId]
    }));
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Active', 'Notify Class Changes', 'Notes'];
    const rows = students.map(s => [
      s.name,
      s.email,
      s.phone || '',
      s.active ? 'Yes' : 'No',
      s.notify_class_changes ? 'Yes' : 'No',
      (s.notes || '').replace(/,/g, ';')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyNotifyEmails = () => {
    const emails = students
      .filter(s => s.active && s.notify_class_changes)
      .map(s => s.email)
      .join(', ');
    navigator.clipboard.writeText(emails);
    alert(`Copied ${emails.split(',').length} email addresses for class change notifications!`);
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.day} - ${cls.title}` : classId;
  };

  const activeStudents = students.filter(s => s.active);
  const notifyStudents = students.filter(s => s.active && s.notify_class_changes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4" data-testid="admin-students-page">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4 p-2 hover:bg-blue-500/10 rounded transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="text-blue-500" size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white torture-text">Student Database</h1>
              <p className="text-gray-400 mt-2">Manage students for class change notifications</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!showForm && (
              <>
                <button
                  onClick={copyNotifyEmails}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
                  disabled={notifyStudents.length === 0}
                  data-testid="copy-notify-emails"
                >
                  <Copy size={18} className="mr-2" />
                  Copy Notify Emails
                </button>
                <button
                  onClick={downloadCSV}
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
                  disabled={students.length === 0}
                  data-testid="download-csv"
                >
                  <Download size={18} className="mr-2" />
                  Download CSV
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                  data-testid="add-student-button"
                >
                  <Plus size={20} className="mr-2" />
                  Add Student
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{students.length}</div>
              <div className="text-gray-400 text-sm mt-1">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">{activeStudents.length}</div>
              <div className="text-gray-400 text-sm mt-1">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">{notifyStudents.length}</div>
              <div className="text-gray-400 text-sm mt-1">Receive Class Notifications</div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-black border border-blue-500/20 rounded-lg p-8 mb-8" data-testid="student-form">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Student's full name"
                    required
                    data-testid="student-name-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="student@email.com"
                    required
                    data-testid="student-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="(555) 123-4567"
                    data-testid="student-phone-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Any additional notes..."
                    data-testid="student-notes-input"
                  />
                </div>
              </div>

              {/* Class Selection */}
              {classes.length > 0 && (
                <div>
                  <label className="block text-gray-300 mb-3">Enrolled Classes</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {classes.map(cls => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => handleClassToggle(cls.id)}
                        className={`p-3 rounded border text-left text-sm transition-colors ${
                          formData.classes.includes(cls.id)
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-semibold">{cls.day}</div>
                        <div className="text-xs opacity-75">{cls.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle Options */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Active Student</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notify_class_changes}
                    onChange={(e) => setFormData({ ...formData, notify_class_changes: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Notify about class schedule changes</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition-colors"
                  data-testid="save-student-button"
                >
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-700 text-white px-8 py-3 rounded font-semibold hover:bg-gray-600 transition-colors"
                  data-testid="cancel-student-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students List */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Student List</h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>No students yet. Click "Add Student" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-500/20">
                    <th className="text-left text-gray-400 font-semibold py-3 px-4">Name</th>
                    <th className="text-left text-gray-400 font-semibold py-3 px-4">Email</th>
                    <th className="text-left text-gray-400 font-semibold py-3 px-4">Phone</th>
                    <th className="text-center text-gray-400 font-semibold py-3 px-4">Notify</th>
                    <th className="text-center text-gray-400 font-semibold py-3 px-4">Status</th>
                    <th className="text-center text-gray-400 font-semibold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors"
                      data-testid={`student-row-${student.id}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                          <span className="text-white font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{student.email}</td>
                      <td className="py-4 px-4 text-gray-400">{student.phone || '-'}</td>
                      <td className="py-4 px-4 text-center">
                        {student.notify_class_changes ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                            <Bell size={14} className="mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
                            <BellOff size={14} className="mr-1" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {student.active ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">Active</span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">Inactive</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            data-testid={`edit-student-${student.id}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            data-testid={`delete-student-${student.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center space-x-2">
            <Mail size={20} />
            <span>Class Change Notifications</span>
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Students with "Notify about class changes" enabled will receive schedule updates</li>
            <li>• Use "Copy Notify Emails" to get a list of emails for sending notifications</li>
            <li>• Download CSV to export all student data for external use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
