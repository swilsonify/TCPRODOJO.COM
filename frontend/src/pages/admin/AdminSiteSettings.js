import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Image, Type, Link as LinkIcon, Settings, RefreshCw, Upload } from 'lucide-react';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const AdminSiteSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [formData, setFormData] = useState({
    settingKey: '',
    settingValue: '',
    settingType: 'image',
    description: ''
  });

  const API = process.env.REACT_APP_BACKEND_URL || '';

  // Predefined logo settings that users might want to manage
  const predefinedSettings = [
    { key: 'homepage_logo', label: 'Homepage Logo', type: 'image', description: 'Main logo displayed on the homepage' },
    { key: 'circle_logo', label: 'Circle Logo (Navigation)', type: 'image', description: 'Round logo shown in navigation bar' },
    { key: 'nav_tagline', label: 'Navigation Tagline', type: 'text', description: 'Text shown above logo in nav (e.g., "TRAIN LIKE A CHAMPION")' },
    { key: 'nav_title', label: 'Navigation Title', type: 'text', description: 'Main title in navigation (e.g., "TORTURE CHAMBER")' },
    { key: 'footer_logo', label: 'Footer Logo', type: 'image', description: 'Logo displayed in the footer' },
    { key: 'admin_logo', label: 'Admin Panel Logo', type: 'image', description: 'Logo shown in admin dashboard header' },
    { key: 'home_bottom_photo', label: 'Home Bottom Photo', type: 'image', description: 'Photo displayed under the Start Your Journey button on the Home page' },
    { key: 'classes_photo', label: 'Classes Page Photo', type: 'image', description: 'Photo displayed below the class schedule calendar' },
    { key: 'classes_photo_caption', label: 'Classes Photo Caption', type: 'text', description: 'Optional caption text below the classes page photo' },
    { key: 'coaches_page_photo', label: 'Coaches Page Photo', type: 'image', description: 'Photo displayed on the Success/Coaches page above the Start Training button' },
    { key: 'coaches_page_photo_2', label: 'Coaches Page Photo 2', type: 'image', description: 'Second photo on the Success page, above the Join the Team button' },
    { key: 'classes_header_photo', label: 'Classes Header Photo', type: 'image', description: 'Photo displayed above the class schedule calendar' },
    { key: 'training_header_photo', label: 'Training Header Photo', type: 'image', description: 'Header banner image at the top of the Training page' },
    { key: 'training_featured_photo', label: 'Training Featured Photo', type: 'image', description: 'Large featured photo below the header on the Training page' },
    { key: 'training_grid_photo_1', label: 'Training Grid Photo 1', type: 'image', description: 'Training page grid photo #1' },
    { key: 'training_grid_photo_2', label: 'Training Grid Photo 2', type: 'image', description: 'Training page grid photo #2' },
    { key: 'training_grid_photo_3', label: 'Training Grid Photo 3', type: 'image', description: 'Training page grid photo #3' },
    { key: 'training_grid_photo_4', label: 'Training Grid Photo 4', type: 'image', description: 'Training page grid photo #4' },
    { key: 'training_grid_photo_5', label: 'Training Grid Photo 5', type: 'image', description: 'Training page grid photo #5' },
    { key: 'training_grid_photo_6', label: 'Training Grid Photo 6', type: 'image', description: 'Training page grid photo #6' },
    { key: 'training_grid_photo_7', label: 'Training Grid Photo 7', type: 'image', description: 'Training page grid photo #7' },
    { key: 'training_grid_photo_8', label: 'Training Grid Photo 8', type: 'image', description: 'Training page grid photo #8' },
    { key: 'training_grid_photo_9', label: 'Training Grid Photo 9', type: 'image', description: 'Training page grid photo #9' },
    { key: 'training_grid_photo_10', label: 'Training Grid Photo 10', type: 'image', description: 'Training page grid photo #10' },
    { key: 'training_grid_photo_11', label: 'Training Grid Photo 11', type: 'image', description: 'Training page grid photo #11' },
    { key: 'training_grid_photo_12', label: 'Training Grid Photo 12', type: 'image', description: 'Training page grid photo #12' },
    { key: 'training_grid_photo_13', label: 'Training Grid Photo 13', type: 'image', description: 'Training page grid photo #13' },
    { key: 'training_grid_photo_14', label: 'Training Grid Photo 14', type: 'image', description: 'Training page grid photo #14' },
    { key: 'training_grid_photo_15', label: 'Training Grid Photo 15', type: 'image', description: 'Training page grid photo #15' },
    { key: 'training_grid_photo_16', label: 'Training Grid Photo 16', type: 'image', description: 'Training page grid photo #16' },
    { key: 'events_photo_1', label: 'Events Page Photo 1', type: 'image', description: 'Events page photo row #1' },
    { key: 'events_photo_2', label: 'Events Page Photo 2', type: 'image', description: 'Events page photo row #2' },
    { key: 'events_photo_3', label: 'Events Page Photo 3', type: 'image', description: 'Events page photo row #3' },
    { key: 'events_photo_4', label: 'Events Page Photo 4', type: 'image', description: 'Events page photo row #4' }
  ];

  const settingTypes = [
    { value: 'image', label: 'Image URL', icon: Image },
    { value: 'text', label: 'Text', icon: Type },
    { value: 'link', label: 'Link', icon: LinkIcon }
  ];

  useEffect(() => {
    verifyAuth();
    loadSettings();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/site-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
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
      if (editingSetting) {
        await axios.put(`${API}/api/admin/site-settings/${editingSetting.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/site-settings`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await loadSettings();
      resetForm();
    } catch (error) {
      console.error('Error saving setting:', error);
      alert(error.response?.data?.detail || 'Error saving setting. Please try again.');
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      settingKey: setting.settingKey,
      settingValue: setting.settingValue || '',
      settingType: setting.settingType || 'image',
      description: setting.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (settingId) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/site-settings/${settingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadSettings();
    } catch (error) {
      console.error('Error deleting setting:', error);
      alert('Error deleting setting. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      settingKey: '',
      settingValue: '',
      settingType: 'image',
      description: ''
    });
    setEditingSetting(null);
    setShowForm(false);
  };

  const handleQuickAdd = (preset) => {
    setFormData({
      settingKey: preset.key,
      settingValue: '',
      settingType: preset.type,
      description: preset.description
    });
    setEditingSetting(null);
    setShowForm(true);
  };

  const getSettingTypeIcon = (type) => {
    const found = settingTypes.find(t => t.value === type);
    return found ? found.icon : Settings;
  };

  const getSettingLabel = (key) => {
    const found = predefinedSettings.find(p => p.key === key);
    return found ? found.label : key;
  };

  // Check which predefined settings are already created
  const existingKeys = settings.map(s => s.settingKey);
  const availablePresets = predefinedSettings.filter(p => !existingKeys.includes(p.key));

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4" data-testid="admin-site-settings-page">
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
            <div>
              <h1 className="text-3xl font-bold text-white">Site Settings</h1>
              <p className="text-gray-400 text-sm">Manage logos and branding</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              data-testid="add-setting-button"
            >
              <Plus size={20} />
              <span>Add Setting</span>
            </button>
          )}
        </div>

        {/* Quick Add Presets */}
        {!showForm && availablePresets.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Settings size={20} className="text-blue-400" />
              <span>Quick Add Common Settings</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availablePresets.map(preset => {
                const Icon = preset.type === 'image' ? Image : Type;
                return (
                  <button
                    key={preset.key}
                    onClick={() => handleQuickAdd(preset)}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded transition-colors text-left"
                    data-testid={`quick-add-${preset.key}`}
                  >
                    <Icon size={18} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8" data-testid="setting-form">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingSetting ? 'Edit Setting' : 'Add New Setting'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Setting Key *</label>
                  <input
                    type="text"
                    value={formData.settingKey}
                    onChange={(e) => setFormData({ ...formData, settingKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="e.g., homepage_logo"
                    required
                    disabled={editingSetting}
                    data-testid="setting-key-input"
                  />
                  <p className="text-gray-400 text-xs mt-1">Unique identifier (use underscores, no spaces)</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Type *</label>
                  <select
                    value={formData.settingType}
                    onChange={(e) => setFormData({ ...formData, settingType: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    data-testid="setting-type-select"
                  >
                    {settingTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cloudinary Upload for Image Type */}
              {formData.settingType === 'image' && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <label className="block text-gray-300 mb-3 flex items-center space-x-2">
                    <Upload size={18} className="text-blue-400" />
                    <span>Upload Logo to Cloudinary</span>
                  </label>
                  <CloudinaryUploader
                    folder="tcprodojo/logos"
                    resourceType="image"
                    accept="image/*"
                    label="Upload Logo Image"
                    currentUrl={formData.settingValue}
                    onUploadComplete={(url) => setFormData({ ...formData, settingValue: url })}
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">
                  {formData.settingType === 'image' ? 'Image URL *' : 
                   formData.settingType === 'link' ? 'URL *' : 'Value *'}
                </label>
                {formData.settingType === 'text' ? (
                  <textarea
                    value={formData.settingValue}
                    onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2 h-24"
                    placeholder="Enter text value..."
                    required
                    data-testid="setting-value-input"
                  />
                ) : (
                  <input
                    type="url"
                    value={formData.settingValue}
                    onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder={formData.settingType === 'image' ? 'https://res.cloudinary.com/...' : 'https://...'}
                    required
                    data-testid="setting-value-input"
                  />
                )}
                {formData.settingType === 'image' && (
                  <p className="text-gray-400 text-xs mt-1">Auto-filled when you upload above, or paste URL manually</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-4 py-2"
                  placeholder="What is this setting for?"
                  data-testid="setting-description-input"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  data-testid="save-setting-button"
                >
                  {editingSetting ? 'Update Setting' : 'Add Setting'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                  data-testid="cancel-setting-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings List */}
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading settings...</div>
        ) : settings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <p>No site settings yet. Use Quick Add above or click "Add Setting" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => {
              const Icon = getSettingTypeIcon(setting.settingType);
              return (
                <div
                  key={setting.id}
                  className="bg-gray-800 rounded-lg p-6 flex justify-between items-start"
                  data-testid={`setting-item-${setting.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon size={20} className="text-blue-400" />
                      <h3 className="text-xl font-bold text-white">{getSettingLabel(setting.settingKey)}</h3>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{setting.settingKey}</span>
                    </div>
                    
                    {setting.description && (
                      <p className="text-gray-400 text-sm mb-3">{setting.description}</p>
                    )}
                    
                    {/* Value Display */}
                    {setting.settingType === 'image' && setting.settingValue ? (
                      <div className="bg-gray-900 rounded-lg p-3 inline-block">
                        <img 
                          src={setting.settingValue} 
                          alt={setting.settingKey}
                          className="max-h-24 object-contain rounded"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-300 text-sm bg-gray-900 px-3 py-2 rounded inline-block max-w-xl truncate">
                        {setting.settingValue}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                      data-testid={`edit-setting-${setting.id}`}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(setting.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      data-testid={`delete-setting-${setting.id}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center space-x-2">
            <RefreshCw size={20} />
            <span>How Logo Updates Work</span>
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Upload your new logo to Cloudinary</li>
            <li>• Copy the Cloudinary URL</li>
            <li>• Update the relevant setting here (e.g., homepage_logo, circle_logo)</li>
            <li>• The website will automatically display the new logo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteSettings;
