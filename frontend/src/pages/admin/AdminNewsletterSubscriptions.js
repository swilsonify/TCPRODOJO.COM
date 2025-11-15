import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Mail } from 'lucide-react';

const AdminNewsletterSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadSubscriptions();
  }, []);

  const verifyAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadSubscriptions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/newsletter-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/api/admin/newsletter-subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Error removing subscriber. Please try again.');
    }
  };

  const downloadCSV = () => {
    // Create CSV content
    const headers = ['Email', 'Subscribed Date'];
    const rows = subscriptions.map(sub => [
      sub.email,
      new Date(sub.subscribed_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyAllEmails = () => {
    const emails = subscriptions.map(sub => sub.email).join(', ');
    navigator.clipboard.writeText(emails);
    alert('All email addresses copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4 p-2 hover:bg-blue-500/10 rounded transition-colors"
            >
              <ArrowLeft className="text-blue-500" size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white torture-text">Newsletter Subscriptions</h1>
              <p className="text-gray-400 mt-2">Manage email newsletter subscribers</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyAllEmails}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
              disabled={subscriptions.length === 0}
            >
              <Mail size={20} className="mr-2" />
              Copy All Emails
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
              disabled={subscriptions.length === 0}
            >
              <Download size={20} className="mr-2" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{subscriptions.length}</div>
              <div className="text-gray-400 text-sm mt-1">Total Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">
                {subscriptions.filter(s => {
                  const date = new Date(s.subscribed_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date > weekAgo;
                }).length}
              </div>
              <div className="text-gray-400 text-sm mt-1">New This Week</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">
                {subscriptions.filter(s => {
                  const date = new Date(s.subscribed_at);
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return date > monthAgo;
                }).length}
              </div>
              <div className="text-gray-400 text-sm mt-1">New This Month</div>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Subscriber List</h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No subscribers yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-500/20">
                    <th className="text-left text-gray-400 font-semibold py-3 px-4">Email Address</th>
                    <th className="text-left text-gray-400 font-semibold py-3 px-4">Subscribed Date</th>
                    <th className="text-center text-gray-400 font-semibold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white">{subscription.email}</td>
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(subscription.subscribed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDelete(subscription.id)}
                          className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletterSubscriptions;
