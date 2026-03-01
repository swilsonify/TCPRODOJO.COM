import { useEffect, useState } from 'react';
import { Image, Video, Mic, FileText, ExternalLink, Play } from 'lucide-react';
import axios from 'axios';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const API = process.env.REACT_APP_BACKEND_URL || '';

  const mediaTypes = [
    { value: 'all', label: 'All', icon: null },
    { value: 'photo', label: 'Photos', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'podcast', label: 'Podcasts', icon: Mic },
    { value: 'article', label: 'Articles', icon: FileText }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await axios.get(`${API}/api/media`);
      // Hide grid category items from the public media page
      const publicMedia = (response.data || []).filter(m => m.category !== 'grid');
      setMedia(publicMedia);
    } catch (error) {
      console.error('Error loading media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const getMediaTypeIcon = (type) => {
    const found = mediaTypes.find(t => t.value === type);
    return found?.icon || Image;
  };

  const getMediaTypeLabel = (type) => {
    const found = mediaTypes.find(t => t.value === type);
    return found ? found.label.slice(0, -1) : 'Photo'; // Remove 's' from plural
  };

  const filteredMedia = activeFilter === 'all' 
    ? media 
    : media.filter(item => item.mediaType === activeFilter);

  const convertToEmbedUrl = (url) => {
    if (!url) return url;
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('watch?v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="media-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">MEDIA</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore photos, videos, podcasts, and articles from Torture Chamber Pro Wrestling Dojo.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {mediaTypes.map(type => {
            const Icon = type.icon;
            const count = type.value === 'all' 
              ? media.length 
              : media.filter(m => m.mediaType === type.value).length;
            
            return (
              <button
                key={type.value}
                onClick={() => setActiveFilter(type.value)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                  activeFilter === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                data-testid={`filter-${type.value}`}
              >
                {Icon && <Icon size={18} />}
                <span>{type.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeFilter === type.value ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading media...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <Image size={64} className="mx-auto" />
            </div>
            <p className="text-gray-400 text-lg">
              {activeFilter === 'all' 
                ? 'No media content available yet.' 
                : `No ${activeFilter}s available yet.`}
            </p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMedia.map((item, index) => {
              const Icon = getMediaTypeIcon(item.mediaType);
              const hasVideo = item.mediaType === 'video' && item.mediaUrl;
              const embedUrl = convertToEmbedUrl(item.mediaUrl);
              
              return (
                <div
                  key={item.id || index}
                  className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden hover-lift group"
                  data-testid={`media-item-${index}`}
                >
                  {/* Media Preview */}
                  <div className="relative aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                    {/* Photo */}
                    {item.mediaType === 'photo' && item.mediaUrl ? (
                      <img 
                        src={item.mediaUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : hasVideo && embedUrl.includes('youtube.com/embed') ? (
                      /* YouTube Video */
                      <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : item.thumbnailUrl ? (
                      /* Thumbnail with play overlay */
                      <div className="relative w-full h-full">
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {(item.mediaType === 'video' || item.mediaType === 'podcast') && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                              <Play size={32} className="text-white ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Placeholder */
                      <div className="text-center p-8">
                        <Icon size={64} className="text-blue-500/50 mx-auto mb-3" />
                        <span className="text-gray-500">{getMediaTypeLabel(item.mediaType)}</span>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center space-x-1.5">
                      <Icon size={14} />
                      <span>{getMediaTypeLabel(item.mediaType)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>
                    )}
                    
                    {/* External Link Button */}
                    {item.externalLink && (
                      <a 
                        href={item.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                        data-testid={`view-link-${index}`}
                      >
                        <ExternalLink size={16} />
                        <span>
                          {item.mediaType === 'podcast' ? 'Listen Now' :
                           item.mediaType === 'article' ? 'Read Article' :
                           item.mediaType === 'video' ? 'Watch Video' : 'View'}
                        </span>
                      </a>
                    )}
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

export default Media;
