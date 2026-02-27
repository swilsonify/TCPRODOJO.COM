import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Mail, Send, History, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AdminNewsletterSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [newsletterLogs, setNewsletterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers', 'compose', 'history'
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  
  // Compose form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    verifyAuth();
    loadSubscriptions();
    loadNewsletterLogs();
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

  const loadNewsletterLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/newsletter/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewsletterLogs(response.data);
    } catch (error) {
      console.error('Error loading newsletter logs:', error);
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

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in both subject and content');
      return;
    }

    if (!window.confirm(`Are you sure you want to send this newsletter to ${subscriptions.length} subscribers?`)) {
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API}/api/admin/newsletter/send`, 
        { subject, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSendResult({
        success: true,
        message: response.data.message,
        successful: response.data.successful,
        failed: response.data.failed,
        total: response.data.total
      });
      
      // Clear form on success
      setSubject('');
      setContent('');
      
      // Reload logs
      loadNewsletterLogs();
      
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setSendResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to send newsletter. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Email', 'Subscribed Date'];
    const rows = subscriptions.map(sub => [
      sub.email,
      new Date(sub.subscribed_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4" data-testid="admin-newsletter-page">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4 p-2 hover:bg-blue-500/10 rounded transition-colors"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="text-blue-500" size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white torture-text">Newsletter</h1>
              <p className="text-gray-400 mt-2">Manage subscribers and send newsletters</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'subscribers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            data-testid="tab-subscribers"
          >
            <Mail size={20} className="mr-2" />
            Subscribers ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'compose' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            data-testid="tab-compose"
          >
            <Send size={20} className="mr-2" />
            Compose Newsletter
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'history' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            data-testid="tab-history"
          >
            <History size={20} className="mr-2" />
            Send History
          </button>
        </div>

        {/* SUBSCRIBERS TAB */}
        {activeTab === 'subscribers' && (
          <>
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

            {/* Actions */}
            <div className="flex gap-3 mb-6">
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
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                disabled={subscriptions.length === 0}
              >
                <Download size={20} className="mr-2" />
                Download CSV
              </button>
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
          </>
        )}

        {/* COMPOSE TAB */}
        {activeTab === 'compose' && (
          <div className="bg-black border border-green-500/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <Send size={24} className="mr-3 text-green-400" />
              Compose Newsletter
            </h2>
            <p className="text-gray-400 mb-6">
              This will send an email to all {subscriptions.length} subscribers
            </p>

            {/* Send Result Message */}
            {sendResult && (
              <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                sendResult.success 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                {sendResult.success ? (
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <p className={sendResult.success ? 'text-green-400' : 'text-red-400'}>
                    {sendResult.message}
                  </p>
                  {sendResult.success && (
                    <p className="text-gray-400 text-sm mt-1">
                      Successful: {sendResult.successful} | Failed: {sendResult.failed}
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSendNewsletter} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Subject Line *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., This Week at TC Pro Dojo"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                  data-testid="newsletter-subject"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Newsletter Content *</label>
                <p className="text-gray-500 text-sm mb-2">You can use basic HTML for formatting</p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<h2>Hello Champions!</h2>
<p>Here's what's happening this week at TC Pro Dojo...</p>

<h3>Upcoming Classes</h3>
<ul>
  <li>Monday: Beginner Wrestling 6PM</li>
  <li>Wednesday: Advanced Techniques 7PM</li>
</ul>

<p>See you on the mats!</p>"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 h-64 font-mono text-sm"
                  required
                  data-testid="newsletter-content"
                />
              </div>

              {/* Preview */}
              {content && (
                <div>
                  <label className="block text-white font-semibold mb-2">Preview</label>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <h1 className="text-blue-400 text-xl font-bold">TC PRO DOJO</h1>
                      <p className="text-gray-500 text-xs">TORTURE CHAMBER PRO WRESTLING</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-white prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={sending || subscriptions.length === 0}
                  className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  data-testid="send-newsletter-button"
                >
                  {sending ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      Send to {subscriptions.length} Subscribers
                    </>
                  )}
                </button>
              </div>

              {subscriptions.length === 0 && (
                <p className="text-yellow-500 text-sm">
                  You need at least one subscriber before you can send a newsletter.
                </p>
              )}
            </form>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-black border border-purple-500/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <History size={24} className="mr-3 text-purple-400" />
              Newsletter Send History
            </h2>

            {newsletterLogs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>No newsletters sent yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {newsletterLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="bg-gray-900 border border-purple-500/20 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{log.subject}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Sent by {log.sent_by} on {new Date(log.sent_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-green-400 font-bold text-xl">{log.successful}</span>
                            <span className="text-gray-500 text-sm ml-1">sent</span>
                          </div>
                          {log.failed > 0 && (
                            <div>
                              <span className="text-red-400 font-bold text-xl">{log.failed}</span>
                              <span className="text-gray-500 text-sm ml-1">failed</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">of {log.total_recipients} recipients</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletterSubscriptions;
