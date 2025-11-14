import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Copy, Check } from 'lucide-react';

const AdminMediaLibrary = () => {
  const navigate = useNavigate();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const API = process.env.REACT_APP_BACKEND_URL || '';

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
      setMediaFiles(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem('adminToken');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post(`${API}/api/admin/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      await loadMedia();
      alert(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.filename}?`)) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      // Use public_id for deletion if available, otherwise filename
      const deleteId = file.public_id || file.filename;
      await axios.delete(`${API}/api/admin/media/${encodeURIComponent(deleteId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadMedia();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  const copyToClipboard = (url) => {
    // For Cloudinary URLs, use the full URL directly
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename);
  };

  const isVideo = (filename) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(filename);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Media Library</h1>
          </div>
          <label className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
            <Upload size={20} />
            <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-2">How to Use Media Library</h2>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Upload photos and videos by clicking "Upload Files"</li>
            <li>• Click the copy icon to copy the file URL</li>
            <li>• Paste the URL in any admin form (coaches, success stories, gallery, etc.)</li>
            <li>• Supported formats: JPG, PNG, GIF, WebP, SVG, MP4, WebM, OGG, MOV</li>
          </ul>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading media files...</div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg">
            <Upload size={48} className="mx-auto mb-4 text-gray-600" />
            <p>No media files yet. Upload some to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mediaFiles.map((file) => (
              <div
                key={file.filename}
                className="bg-gray-800 rounded-lg overflow-hidden group"
              >
                <div className="aspect-square bg-gray-700 flex items-center justify-center">
                  {isImage(file.filename) ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo(file.filename) ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-center p-4">
                      <p className="text-xs break-all">{file.filename}</p>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-mono truncate mb-2">{file.filename}</p>
                  <p className="text-gray-500 text-xs mb-3">{formatFileSize(file.size)}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                    >
                      {copiedUrl === file.url ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                    >
                      <Trash2 size={14} />
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

export default AdminMediaLibrary;
