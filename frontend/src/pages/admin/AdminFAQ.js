import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', displayOrder: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API}/admin/faqs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(response.data);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editingFaq) {
        await axios.put(`${API}/admin/faqs/${editingFaq.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/faqs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      loadFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ. Please try again.');
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer, displayOrder: faq.displayOrder });
    setShowForm(true);
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/admin/faqs/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFaq(null);
    setFormData({ question: '', answer: '', displayOrder: 0 });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">FAQ Management</h1>
              <p className="text-gray-400">Manage frequently asked questions</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add FAQ</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Do I need experience?"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Your answer here..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-32 px-4 py-3 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">
                  {editingFaq ? 'Update FAQ' : 'Add FAQ'}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No FAQs yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-gray-900 border border-blue-500/20 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-400 text-sm">{faq.answer}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => handleEdit(faq)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFAQ;
