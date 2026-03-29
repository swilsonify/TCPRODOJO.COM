import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Package, Eye, EyeOff } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', imageUrl: '', sizes: '',
    category: 'merch', active: true, displayOrder: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { navigate('/admin/login'); return; }
      const res = await axios.get(`${API}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (e) {
      if (e.response?.status === 401) {
        navigate('/admin/login');
      } else {
        console.error('Error loading products:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      displayOrder: parseInt(formData.displayOrder) || 0
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/api/admin/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/admin/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      loadProducts();
    } catch (e) {
      console.error('Error saving product:', e);
      if (e.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/admin/login');
      } else {
        alert('Error saving product: ' + (e.response?.data?.detail || e.message));
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      imageUrl: product.imageUrl || '',
      sizes: (product.sizes || []).join(', '),
      category: product.category || 'merch',
      active: product.active !== false,
      displayOrder: product.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProducts();
    } catch (e) {
      alert('Error deleting product.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', imageUrl: '', sizes: '', category: 'merch', active: true, displayOrder: 0 });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="mr-4 p-2 hover:bg-blue-500/10 rounded">
              <ArrowLeft className="text-blue-500" size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white torture-text">Product Manager</h1>
              <p className="text-gray-400 mt-1">Manage shop products</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded" data-testid="add-product-btn">
            <Plus size={20} className="mr-2" /> Add Product
          </button>
        </div>

        {showForm && (
          <div className="bg-black border border-blue-500/20 rounded-lg p-8 mb-8" data-testid="product-form">
            <h2 className="text-2xl font-bold text-white mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500" data-testid="product-name-input" />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Price (CAD)</label>
                  <input type="number" step="0.01" min="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500" data-testid="product-price-input" />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Image URL (Cloudinary)</label>
                  <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500" data-testid="product-image-input" />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Sizes (comma-separated)</label>
                  <input type="text" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL, 2XL"
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500" data-testid="product-sizes-input" />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 rounded" />
                    <span className="font-semibold text-sm">Active (visible in shop)</span>
                  </label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2 text-sm">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3" className="w-full px-4 py-2 bg-gray-900 border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500" data-testid="product-desc-input" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded" data-testid="save-product-btn">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-black border border-blue-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Package size={24} className="mr-3 text-blue-400" />
            Products ({products.length})
          </h2>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No products yet. Click "Add Product" to create one.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className={`border rounded-lg overflow-hidden ${p.active ? 'border-blue-500/20' : 'border-red-500/30 opacity-60'}`} data-testid={`product-card-${p.id}`}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                      <Package size={48} className="text-gray-600" />
                    </div>
                  )}
                  <div className="p-4 bg-gray-900">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-bold">{p.name}</h3>
                      <span className="text-blue-400 font-bold">${p.price?.toFixed(2)}</span>
                    </div>
                    {p.description && <p className="text-gray-400 text-sm mb-2 line-clamp-2">{p.description}</p>}
                    {p.sizes?.length > 0 && <p className="text-xs text-gray-500 mb-2">Sizes: {p.sizes.join(', ')}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.active ? 'Active' : 'Hidden'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(p)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
