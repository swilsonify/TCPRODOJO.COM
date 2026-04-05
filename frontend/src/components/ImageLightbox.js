import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * ImageLightbox Component
 * A reusable lightbox component for displaying images in an expanded view
 * 
 * Props:
 * - images: Array of image objects with { url, alt, title? }
 * - currentIndex: The index of the currently displayed image
 * - isOpen: Boolean to control visibility
 * - onClose: Function to call when closing the lightbox
 * - onNavigate: Optional function called with new index when navigating
 */
const ImageLightbox = ({ images = [], currentIndex = 0, isOpen, onClose, onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Sync activeIndex with currentIndex prop
  useEffect(() => {
    setActiveIndex(currentIndex);
    setIsZoomed(false);
  }, [currentIndex, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        navigatePrev();
        break;
      case 'ArrowRight':
        navigateNext();
        break;
      default:
        break;
    }
  }, [isOpen, activeIndex, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigatePrev = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
    setActiveIndex(newIndex);
    setIsZoomed(false);
    onNavigate?.(newIndex);
  };

  const navigateNext = () => {
    const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    setIsZoomed(false);
    onNavigate?.(newIndex);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      data-testid="image-lightbox-overlay"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        data-testid="lightbox-close-btn"
      >
        <X size={28} />
      </button>

      {/* Zoom button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
        className="absolute top-4 right-16 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        data-testid="lightbox-zoom-btn"
      >
        {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
      </button>

      {/* Previous button */}
      {hasMultipleImages && (
        <button
          onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          data-testid="lightbox-prev-btn"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Next button */}
      {hasMultipleImages && (
        <button
          onClick={(e) => { e.stopPropagation(); navigateNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          data-testid="lightbox-next-btn"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Image container */}
      <div 
        className={`relative max-w-[90vw] max-h-[85vh] ${isZoomed ? 'overflow-auto cursor-zoom-out' : 'overflow-hidden cursor-zoom-in'}`}
        onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt || 'Image'}
          className={`transition-transform duration-300 ${isZoomed ? 'max-w-none w-auto h-auto scale-150' : 'max-w-full max-h-[85vh] w-auto h-auto object-contain'}`}
          data-testid="lightbox-image"
        />
      </div>

      {/* Image title/caption */}
      {currentImage.title && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-black/70 text-white text-center rounded-lg max-w-lg">
          <p className="text-lg font-semibold">{currentImage.title}</p>
        </div>
      )}

      {/* Image counter */}
      {hasMultipleImages && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-medium">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

/**
 * ClickableImage Component
 * A wrapper component that makes an image clickable to open in lightbox
 */
export const ClickableImage = ({ 
  src, 
  alt, 
  title,
  className = '', 
  containerClassName = '',
  galleryImages = null,
  galleryIndex = 0,
  onClick,
  ...props 
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(galleryIndex);

  // If galleryImages is provided, use that array; otherwise, create a single-image array
  const images = galleryImages || [{ url: src, alt, title }];

  const handleClick = (e) => {
    e.stopPropagation();
    setCurrentIndex(galleryIndex);
    setIsLightboxOpen(true);
    onClick?.(e);
  };

  return (
    <>
      <div 
        className={`cursor-pointer group ${containerClassName}`}
        onClick={handleClick}
        data-testid="clickable-image-container"
      >
        <img
          src={src}
          alt={alt}
          className={`transition-all duration-300 group-hover:opacity-90 ${className}`}
          {...props}
        />
        {/* Hover overlay with expand icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <ZoomIn className="text-white" size={32} />
        </div>
      </div>
      
      <ImageLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setCurrentIndex}
      />
    </>
  );
};

export default ImageLightbox;
