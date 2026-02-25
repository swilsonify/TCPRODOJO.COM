import { useState, useRef } from 'react';
import { Upload, X, Loader2, Check, Image, Video } from 'lucide-react';

const CloudinaryUploader = ({ 
  onUploadComplete, 
  folder = "tcprodojo/media",
  resourceType = "image",
  accept = "image/*",
  label = "Upload Image",
  currentUrl = "",
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const API = process.env.REACT_APP_BACKEND_URL || '';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB for images, 100MB for videos)
    const maxSize = resourceType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max size: ${resourceType === 'video' ? '100MB' : '10MB'}`);
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      // Get signature from backend
      const token = localStorage.getItem('adminToken');
      const sigResponse = await fetch(
        `${API}/api/admin/cloudinary/signature?resource_type=${resourceType}&folder=${folder}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!sigResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const sig = await sigResponse.json();

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const url = response.secure_url;
          setUploadedUrl(url);
          onUploadComplete(url, response);
          setUploading(false);
        } else {
          setError('Upload failed. Please try again.');
          setUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please check your connection.');
        setUploading(false);
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`);
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setUploadedUrl('');
    setProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete('', null);
  };

  const Icon = resourceType === 'video' ? Video : Image;

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${uploading ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800'}
          ${error ? 'border-red-500' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-white font-medium mb-2">Uploading...</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">{progress}%</p>
          </div>
        ) : uploadedUrl ? (
          <div className="text-center">
            <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-medium">Upload Complete!</p>
            <p className="text-gray-400 text-xs mt-1 truncate max-w-full">{uploadedUrl}</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-white font-medium">{label}</p>
            <p className="text-gray-400 text-sm mt-1">
              Click to browse or drag and drop
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {resourceType === 'video' ? 'Max 100MB • MP4, MOV, WebM' : 'Max 10MB • JPG, PNG, WebP, GIF'}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <X size={14} />
          <span>{error}</span>
        </p>
      )}

      {/* Preview */}
      {showPreview && uploadedUrl && (
        <div className="relative bg-gray-900 rounded-lg p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearUpload();
            }}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full z-10"
            title="Remove"
          >
            <X size={14} />
          </button>
          
          {resourceType === 'video' ? (
            <video 
              src={uploadedUrl} 
              controls 
              className="max-h-48 mx-auto rounded"
            />
          ) : (
            <img 
              src={uploadedUrl} 
              alt="Preview" 
              className="max-h-48 mx-auto object-contain rounded"
            />
          )}
        </div>
      )}

      {/* URL Display (can be copied) */}
      {uploadedUrl && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={uploadedUrl}
            readOnly
            className="flex-1 bg-gray-800 text-gray-300 text-xs rounded px-3 py-2 border border-gray-700"
          />
          <button
            onClick={() => navigator.clipboard.writeText(uploadedUrl)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;
