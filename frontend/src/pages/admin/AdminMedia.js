import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Image, Video, Mic, FileText, ExternalLink, Upload } from 'lucide-react';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const AdminMedia = () => {
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'photo',
    mediaUrl: '',
    thumbnailUrl: '',
    externalLink: '',
    category: 'general',
    displayOrder: 0
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  const mediaTypes = [
    { value: 'photo', label: 'Photo', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'podcast', label: 'Podcast', icon: Mic },
    { value: 'article', label: 'Article', icon: FileText }
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
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedia(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
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
      if (editingMedia) {
        await axios.put(`${API}/api/admin/media/${editingMedia.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/media`, formData, {
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
    setEditingMedia(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      externalLink: item.externalLink || '',
      category: item.category || 'general',
      displayOrder: item.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/media/${mediaId}`, {
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
      description: '',
      mediaType: 'photo',
      mediaUrl: '',
      thumbnailUrl: '',
      externalLink: '',
      displayOrder: 0
    });
    setEditingMedia(null);
    setShowForm(false);
  };

  const getMediaTypeIcon = (type) => {
    const found = mediaTypes.find(t => t.value === type);
    return found ? found.icon : Image;
  };

  const getMediaTypeLabel = (type) => {
    const found = mediaTypes.find(t => t.value === type);
    return found ? found.label : 'Photo';
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4" data-testid="admin-media-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Manage Media</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              data-testid="add-media-button"
            >
              <Plus size={20} />
              <span>Add Media</span>
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8" data-testid="media-form">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingMedia ? 'Edit Media' : 'Add New Media'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., TC Pro Dojo Podcast Episode 1"
                    required
                    data-testid="media-title-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Media Type *</label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    data-testid="media-type-select"
                  >
                    {mediaTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2 h-24"
                  placeholder="Brief description of the media content..."
                  data-testid="media-description-input"
                />
              </div>

              {/* Cloudinary Upload Section */}
              {(formData.mediaType === 'photo' || formData.mediaType === 'video') && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <label className="block text-gray-300 mb-3 flex items-center space-x-2">
                    <Upload size={18} className="text-blue-400" />
                    <span>Upload {formData.mediaType === 'photo' ? 'Image' : 'Video'} to Cloudinary</span>
                  </label>
                  <CloudinaryUploader
                    folder="tcprodojo/media"
                    resourceType={formData.mediaType === 'photo' ? 'image' : 'video'}
                    accept={formData.mediaType === 'photo' ? 'image/*' : 'video/*'}
                    label={`Upload ${formData.mediaType === 'photo' ? 'Photo' : 'Video'}`}
                    currentUrl={formData.mediaUrl}
                    onUploadComplete={(url) => setFormData({ ...formData, mediaUrl: url })}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    {formData.mediaType === 'photo' ? 'Image URL *' : 
                     formData.mediaType === 'video' ? 'Video URL (YouTube or Cloudinary)' :
                     'Media URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="https://res.cloudinary.com/..."
                    required={formData.mediaType === 'photo'}
                    data-testid="media-url-input"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    {formData.mediaType === 'photo' || formData.mediaType === 'video' 
                      ? 'Auto-filled when you upload above, or paste URL manually'
                      : 'Paste external URL for podcasts/articles'}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Thumbnail URL (Cloudinary)</label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="https://res.cloudinary.com/..."
                    data-testid="media-thumbnail-input"
                  />
                  <p className="text-gray-400 text-xs mt-1">Optional preview image</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">External Link</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="https://..."
                    data-testid="media-external-link-input"
                  />
                  <p className="text-gray-400 text-xs mt-1">Link to full article, podcast player, etc.</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    min="0"
                    data-testid="media-order-input"
                  />
                  <p className="text-gray-400 text-xs mt-1">Lower numbers appear first</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  data-testid="save-media-button"
                >
                  {editingMedia ? 'Update Media' : 'Add Media'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                  data-testid="cancel-media-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Media List */}
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading media...</div>
        ) : media.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No media items yet. Click "Add Media" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => {
              const Icon = getMediaTypeIcon(item.mediaType);
              return (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                  data-testid={`media-item-${item.id}`}
                >
                  {/* Thumbnail/Preview */}
                  <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                    {item.thumbnailUrl || (item.mediaType === 'photo' && item.mediaUrl) ? (
                      <img 
                        src={item.thumbnailUrl || item.mediaUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.mediaType === 'video' && item.mediaUrl && item.mediaUrl.includes('youtube') ? (
                      <iframe
                        className="w-full h-full"
                        src={item.mediaUrl}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="text-center">
                        <Icon size={48} className="text-blue-400 mx-auto mb-2" />
                        <span className="text-gray-500 text-sm">{getMediaTypeLabel(item.mediaType)}</span>
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded text-xs font-semibold text-white flex items-center space-x-1">
                      <Icon size={12} />
                      <span>{getMediaTypeLabel(item.mediaType)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    )}
                    
                    {/* Links */}
                    {item.externalLink && (
                      <a 
                        href={item.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm flex items-center space-x-1 mb-3 hover:text-blue-300"
                      >
                        <ExternalLink size={14} />
                        <span>View External Link</span>
                      </a>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t border-gray-700">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 text-blue-400 hover:text-blue-300 p-2 flex items-center justify-center space-x-1"
                        data-testid={`edit-media-${item.id}`}
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 text-red-400 hover:text-red-300 p-2 flex items-center justify-center space-x-1"
                        data-testid={`delete-media-${item.id}`}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMedia;
