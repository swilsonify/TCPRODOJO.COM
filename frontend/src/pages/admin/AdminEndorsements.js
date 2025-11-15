import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Video } from 'lucide-react';

/**
 * Turn any YouTube URL or ID into a proper embed URL for <iframe>.
 * Supports:
 *  - https://www.youtube.com/watch?v=VIDEOID
 *  - https://youtu.be/VIDEOID
 *  - https://www.youtube.com/shorts/VIDEOID
 *  - already-embed URLs
 *  - bare VIDEOID
 */
const normalizeYouTubeUrl = (rawUrl) => {
  if (!rawUrl) return '';

  const url = rawUrl.trim();

  // If they paste just the video ID
  if (!url.startsWith('http')) {
    return `https://www.youtube.com/embed/${url}`;
  }

  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    // Short links: youtu.be/VIDEOID
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]; // "VIDEOID"
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    // Normal YouTube domains
    if (host.endsWith('youtube.com')) {
      // Already an embed URL
      if (u.pathname.startsWith('/embed/')) {
        return url;
      }

      // Watch URLs: youtube.com/watch?v=VIDEOID
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }

      // Shorts: youtube.com/shorts/VIDEOID
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/shorts/')[1]?.split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
    }
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
  }

  // Fallback: return original
  return url;
};

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
    displayOrder: 0,
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadEndorsements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        headers: { Authorization: `Bearer ${token}` },
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

    // Normalize ANY YouTube URL into an embed URL
    const embedUrl = normalizeYouTubeUrl(formData.videoUrl);

    const dataToSubmit = { ...formData, videoUrl: embedUrl };

    try {
      if (editingEndorsement) {
        await axios.put(
          `${API}/api/admin/endorsements/${editingEndorsement.id}`,
          dataToSubmit,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${API}/api/admin/endorsements`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` },
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
      displayOrder: endorsement.displayOrder || 0,
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
        headers: { Authorization: `Bearer ${token}` },
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
      displayOrder: 0,
    });
    setEditingEndorsement(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">
              Manage TC Endorsements
            </h1>
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

        {/* Form */}
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  placeholder="e.g., Kevin Owens, WWE Universal Champion"
