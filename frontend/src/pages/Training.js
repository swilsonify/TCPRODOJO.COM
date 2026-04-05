import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ZoomIn } from 'lucide-react';
import axios from 'axios';
import ImageLightbox from '../components/ImageLightbox';
import { useTranslation } from 'react-i18next';

const Training = () => {
  const [tips, setTips] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const { t } = useTranslation();

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tipsRes, settingsRes] = await Promise.all([
        axios.get(`${API}/api/tips`),
        axios.get(`${API}/api/site-settings`)
      ]);
      setTips(tipsRes.data);
      setSiteSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error loading data:', error);
      setTips([]);
      setSiteSettings({});
    } finally {
      setLoading(false);
    }
  };

  const gridPhotos = [];
  for (let i = 1; i <= 16; i++) {
    const url = siteSettings[`training_grid_photo_${i}`];
    if (url) gridPhotos.push({ url, index: i });
  }

  const gridPhotoImages = gridPhotos.map(photo => ({
    url: photo.url,
    alt: `Training photo ${photo.index}`,
    title: `Training photo ${photo.index}`
  }));

  const openImageLightbox = (images, index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="training-page">
      <div className="container mx-auto max-w-5xl">
        {/* Header Image */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <img
              src={siteSettings.training_header_photo || "/images/your-excuses-v2.webp"}
              alt="Training Header"
              className="max-w-4xl mx-auto w-full px-4"
            />
          </div>
        </div>

        {/* Featured Photo */}
        <div
          className="mb-16 relative cursor-pointer group"
          onClick={() => openImageLightbox([{
            url: siteSettings.training_featured_photo || "https://res.cloudinary.com/dpx8a9k7c/image/upload/v1763246788/WhatsApp_Image_2025-11-15_at_17.43.18_3_djziql.jpg",
            alt: 'TC Pro Dojo Training',
            title: 'TC Pro Dojo Training'
          }])}
        >
          <img
            src={siteSettings.training_featured_photo || "https://res.cloudinary.com/dpx8a9k7c/image/upload/v1763246788/WhatsApp_Image_2025-11-15_at_17.43.18_3_djziql.jpg"}
            alt="TC Pro Dojo Training"
            className="w-full rounded-lg shadow-2xl transition-all duration-300 group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
            <ZoomIn className="text-white" size={48} />
          </div>
        </div>

        {/* Curriculum Section */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-10 mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-white torture-text mb-8 text-center">{t('training.curriculum_title')}</h2>

          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>{t('training.curriculum_p1')}</p>
            <p>{t('training.curriculum_p2')}</p>
            <p>{t('training.curriculum_p3')}</p>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        {gridPhotos.length > 0 && (
          <div className="mb-16" data-testid="training-photo-grid">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gridPhotos.map((photo, idx) => (
                <div
                  key={photo.index}
                  className="aspect-square overflow-hidden rounded-lg border border-blue-500/20 group relative cursor-pointer"
                  data-testid={`training-grid-photo-${photo.index}`}
                  onClick={() => openImageLightbox(gridPhotoImages, idx)}
                >
                  <img
                    src={photo.url}
                    alt={`Training photo ${photo.index}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="text-white" size={32} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Box with How It Works */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-2 border-blue-500 rounded-lg p-10 text-center mb-20">
          <h2 className="text-4xl font-bold text-white torture-text mb-6">{t('training.how_title')}</h2>
          <p className="text-gray-300 text-xl leading-relaxed mb-6">
            {t('training.how_p1')}
          </p>
          <p className="text-gray-300 text-xl mb-6">
            {t('training.how_p2')}
          </p>
          <Link
            to="/contact"
            className="inline-block px-16 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-2xl rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
            data-testid="training-cta-button"
          >
            {t('training.how_button')}
          </Link>
        </div>

        {/* TIPS & TECHNIQUES SECTION */}
        <div className="mb-20">
          <h2 className="text-5xl font-bold text-white torture-text text-center mb-4">{t('training.tips_title')}</h2>
          <div className="gradient-border mx-auto w-24 mb-12"></div>

          {loading ? (
            <div className="text-center text-gray-400">{t('training.tips_loading')}</div>
          ) : tips.length === 0 ? (
            <div className="text-center text-gray-400">{t('training.tips_empty')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tips.map((tip, index) => (
                <div
                  key={tip.id || index}
                  className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden hover-lift"
                  data-testid={`tip-${index}`}
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-900 to-black flex items-center justify-center border-4 border-blue-500">
                    {tip.videoUrl ? (
                      <iframe
                        className="w-full h-full"
                        src={tip.videoUrl}
                        title={tip.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="text-center p-8">
                        <svg className="w-16 h-16 mx-auto mb-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <span className="text-gray-500 text-sm">{t('training.video_coming_soon')}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{tip.title}</h3>
                    {tip.description && (
                      <p className="text-gray-400 text-sm whitespace-pre-line">{tip.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      </div>
    </div>
  );
};

export default Training;
