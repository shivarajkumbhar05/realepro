// src/utils/imageUtils.js

/**
 * Image URL Utility
 * Handles various image formats and resolves them to usable URLs
 */

// ─── Get Base URL ──────────────────────────────────────────────────────
const getBaseUrl = () => {
  // Remove any trailing slashes and spaces
  const url = import.meta.env?.VITE_API_URL?.replace('/api', '')?.trim() || 'https://realepro.onrender.com';
  return url.replace(/\/$/, ''); // Remove trailing slash
};

const BASE_URL = getBaseUrl();

/**
 * Resolve image URL from various formats
 */
export const resolveImageUrl = (image) => {
  if (!image) {
    return null;
  }

  // If it's an array, get the first valid image
  if (Array.isArray(image)) {
    if (image.length === 0) return null;
    return resolveImageUrl(image[0]);
  }

  // If it's a string, process it
  if (typeof image === 'string') {
    // Trim whitespace
    image = image.trim();
    
    // If it's already a full URL
    if (image.startsWith('http://') || 
        image.startsWith('https://') || 
        image.startsWith('data:') || 
        image.startsWith('blob:')) {
      return image;
    }
    
    // If it's a base64 image
    if (image.startsWith('/9j/') || image.startsWith('iVBOR')) {
      return `data:image/jpeg;base64,${image}`;
    }
    
    // If path starts with /uploads, /images, or /api
    if (image.startsWith('/uploads') || 
        image.startsWith('/images') || 
        image.startsWith('/api')) {
      return `${BASE_URL}${image}`;
    }
    
    // If it's just a filename (no path), assume it's in /uploads
    if (!image.includes('/') && !image.includes('\\')) {
      return `${BASE_URL}/uploads/${image}`;
    }
    
    // If it's a relative path without leading slash
    if (!image.startsWith('/')) {
      return `${BASE_URL}/${image}`;
    }
    
    // Default: return as-is
    return image;
  }

  // If it's an object with common image properties
  if (typeof image === 'object' && image !== null) {
    // Check for path property
    if (image.path) {
      return resolveImageUrl(image.path);
    }
    // Check for url property
    if (image.url) {
      return resolveImageUrl(image.url);
    }
    // Check for src property
    if (image.src) {
      return resolveImageUrl(image.src);
    }
    // Check for secure_url (Cloudinary)
    if (image.secure_url) {
      return resolveImageUrl(image.secure_url);
    }
    // Check for public_id (Cloudinary)
    if (image.public_id) {
      return `https://res.cloudinary.com/demo/image/upload/${image.public_id}`;
    }
    // Check for data property
    if (image.data) {
      return resolveImageUrl(image.data);
    }
  }

  // If nothing works, return null
  return null;
};

/**
 * Get the first valid image from a property
 */
export const getFirstImage = (images) => {
  if (!images) return null;
  
  if (Array.isArray(images) && images.length > 0) {
    return resolveImageUrl(images[0]);
  }
  
  if (typeof images === 'object') {
    const values = Object.values(images);
    if (values.length > 0) {
      return resolveImageUrl(values[0]);
    }
  }
  
  return null;
};

/**
 * Get all valid image URLs from a property
 */
export const getAllImages = (images) => {
  if (!images) return [];
  
  let imageArray = [];
  
  if (Array.isArray(images)) {
    imageArray = images;
  } else if (typeof images === 'object') {
    imageArray = Object.values(images);
  } else {
    return [];
  }
  
  return imageArray
    .map(img => resolveImageUrl(img))
    .filter(url => url !== null);
};

/**
 * Check if an image URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  url = url.trim();
  
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      new URL(url);
      return true;
    }
    if (url.startsWith('data:image/')) {
      return true;
    }
    if (url.startsWith('blob:')) {
      return true;
    }
    if (url.startsWith('/9j/') || url.startsWith('iVBOR')) {
      return true;
    }
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Get a placeholder image URL
 */
export const getPlaceholderImage = (text = 'No Image', width = 400, height = 300) => {
  const encodedText = encodeURIComponent(text || 'Property');
  return `https://ui-avatars.com/api/?name=${encodedText}&background=random&size=${width}&color=fff&font-size=0.5`;
};

/**
 * Get a property image or placeholder
 */
export const getPropertyImage = (image, fallbackText = 'Property') => {
  const resolved = resolveImageUrl(image);
  if (resolved && isValidImageUrl(resolved)) {
    return resolved;
  }
  return getPlaceholderImage(fallbackText);
};

/**
 * Generate image URL with fallback
 */
export const getImageWithFallback = (url, fallback = '/images/placeholder.jpg') => {
  const resolved = resolveImageUrl(url);
  if (resolved && isValidImageUrl(resolved)) {
    return resolved;
  }
  return fallback;
};

/**
 * Optimize image URL for different sizes (Cloudinary, etc.)
 */
export const optimizeImage = (url, options = {}) => {
  if (!url) return null;
  
  const { width, height, quality = 'medium', format = 'webp' } = options;
  
  // Only apply to Cloudinary URLs
  if (url && url.includes('cloudinary.com')) {
    let optimizedUrl = url;
    const params = [];
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    if (quality === 'low') params.push('q_auto:low');
    else if (quality === 'medium') params.push('q_auto');
    else if (quality === 'high') params.push('q_auto:best');
    if (format) params.push(`f_${format}`);
    
    if (params.length > 0) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        optimizedUrl = `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
      }
    }
    return optimizedUrl;
  }
  
  return url;
};

/**
 * Get image dimensions from URL
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

/**
 * Preload images for better performance
 */
export const preloadImages = async (images) => {
  if (!images || images.length === 0) return [];
  
  const promises = images.map((img) => {
    return new Promise((resolve) => {
      const imageUrl = getPropertyImage(img);
      const image = new Image();
      image.onload = () => resolve(imageUrl);
      image.onerror = () => resolve(getPlaceholderImage('Image'));
      image.src = imageUrl;
    });
  });
  
  return Promise.all(promises);
};

/**
 * Get a random image from picsum
 */
export const getRandomImage = (seed = 'property', width = 800, height = 600) => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

// Default export
export default {
  resolveImageUrl,
  getFirstImage,
  getAllImages,
  isValidImageUrl,
  getPlaceholderImage,
  getPropertyImage,
  getImageWithFallback,
  optimizeImage,
  getImageDimensions,
  preloadImages,
  getRandomImage,
  BASE_URL,
};