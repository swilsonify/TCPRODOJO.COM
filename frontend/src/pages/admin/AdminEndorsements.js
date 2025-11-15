import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Video } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Turn any YouTube URL (watch, youtu.be, shorts, or bare ID)
 * into a proper embed URL that works in an <iframe>.
 */
const normalizeYouTubeUrl = (rawUrl) => {
  if (!rawUrl) return '';

  const url = rawUrl.trim();

  // If they paste just the ID, accept it
  if (!url.startsWith('http')) {
    return `https://www.youtube.com/embed/${url}`;
  }

  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    // Short URLs: https://youtu.be/VIDEOID
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]; // first segment after '/'
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    // Standard YouTube domains
    if (host.endsWith('youtube.com')) {
      // Already an embed URL
      if (u.pathname.startsWith('/embed/')) {
        return url;
      }

      // Watch URL: https://www.youtube.com/watch?v=VIDEOID
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }

      // Shorts: https://www.youtube.com/shorts/VIDEOID
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/shorts/')[1]?.split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
    }
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
    // Fall through to returning original URL
  }

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

  useEffect(() => {
    verifyAuth();
    loadEndorsements();
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

    const dataToSubmit = {
      ...formData,
      videoUrl: embedUrl,
    };

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
      videoUrl: endorsement.videoUrl, // will already be embed URL from DB
      description: endorsement.description || '',
      displayOrder: endorsement.displayOrder || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (endorsementId) => {
    if (!window.confirm('Are you sure you want to delete this endorsement?')) {
      return;
    }

    const token = localStorage.getI
