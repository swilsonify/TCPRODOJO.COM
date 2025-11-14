import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Image, Plus, Edit, Trash2, ArrowLeft, Video } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminGallery = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterSection, setFilterSection] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    section: 'home-hero',
    type: 'image',
    url: '',
    description: '',
    displayOrder: 0
  });
  const navigate = useNavigate();

  const sections = [
    { value: 'home-hero', label: 'Home - Hero Section' },
    { value: 'home-gallery', label: 'Home - Photo Gallery' },
    { value: 'home-testimonials', label: 'Home - Testimonials Background' },
    { value: 'training-hero', label: 'Training - Hero Image' },
    { value: 'training-programs', label: 'Training - Program Photos' },
    { value: 'classes-hero', label: 'Classes - Hero Image' },
    { value: 'classes-gallery', label: 'Classes - Class Photos' },
    { value: 'events-hero', label: 'Events - Hero Image' },
    { value: 'success-hero', label: 'Success - Hero Image' },
    { value: 'success-stories', label: 'Success - Success Stories (Graduates)' },
    { value: 'success-endorsements', label: 'Success - TC Endorsements' },
    { value: 'success-coaches', label: 'Success - Coaches Photos' },
    { value: 'shop-hero', label: 'Shop - Hero Image' },
    { value: 'contact-hero', label: 'Contact - Hero Image' },
    { value: 'general', label: 'General Site Media' }
  ];

  useEffect(() => {
    verifyAuth();
    loadMedia();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadMedia = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API}/admin/gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMediaItems(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      if (editingItem) {
        await axios.put(`${API}/admin/gallery/${editingItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/gallery`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await loadMedia();
      resetForm();
    } catch (error) {
      console.error('Error saving media:', error);
      alert('Error saving media. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      section: item.section,
      type: item.type,
      url: item.url,
      description: item.description || '',
      displayOrder: item.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/admin/gallery/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Error deleting media. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      section: 'home-hero',
      type: 'image',
      url: '',
      description: '',
      displayOrder: 0
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredMedia = filterSection === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.section === filterSection);

  const getSectionLabel = (value) => {
    const section = sections.find(s => s.value === value);
    return section ? section.label : value;
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
              <h1 className="text-2xl font-bold text-white">Media Gallery Manager</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Plus size={18} />
              <span>Add Media</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filter by Section */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">Filter by Section:</label>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sections</option>
            {sections.map(section => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingItem ? 'Edit Media Item' : 'Add New Media'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Hero Background Image"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    {sections.map(section => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Lower numbers appear first</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">
                  {formData.type === 'image' ? 'Image URL *' : 'Video URL *'}
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  placeholder={formData.type === 'image' ? 'https://i.imgur.com/example.jpg' : 'https://www.youtube.com/watch?v=...'}
                  className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-gray-400 text-xs mt-1">
                  {formData.type === 'image' 
                    ? 'Upload to Imgur and paste URL here' 
                    : 'YouTube or Vimeo URL'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Optional description or caption..."
                  className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                >
                  {editingItem ? 'Update Media' : 'Add Media'}
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

        {/* Media List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading media...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <Image className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-400 text-lg">
              {filterSection === 'all' 
                ? 'No media items yet. Click "Add Media" to upload one.' 
                : 'No media items in this section.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 border border-blue-500/20 rounded-lg overflow-hidden"
              >
                {/* Media Preview */}
                <div className="aspect-video bg-black flex items-center justify-center">
                  {item.type === 'image' ? (
                    item.url ? (
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null
                  ) : (
                    <Video className="text-gray-600" size={48} />
                  )}
                  <div className="hidden w-full h-full items-center justify-center">
                    <Image className="text-gray-600" size={48} />
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">{item.title}</h3>
                      <p className="text-blue-400 text-sm">{getSectionLabel(item.section)}</p>
                      {item.description && (
                        <p className="text-gray-400 text-sm mt-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-blue-500/10">
                    <span className="capitalize">{item.type}</span>
                    <span>Order: {item.displayOrder || 0}</span>
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

export default AdminGallery;
