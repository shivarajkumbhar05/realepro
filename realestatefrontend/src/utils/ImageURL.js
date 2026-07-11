/**
 * Image URL Utility
 * Handles various image formats and resolves them to usable URLs
 */

/**
 * Resolve image URL from various formats
 * @param {string|object|Array} image - Image path, object containing path, or array of images
 * @returns {string|null} - Resolved image URL or null
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
    // If it's already a full URL (http, https, data:, blob:)
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
    
    // Get base URL from environment
    const baseUrl = import.meta.env?.VITE_API_URL || ' https://realepro.onrender.com';
    
    // If path starts with /uploads, /images, or /api
    if (image.startsWith('/uploads') || 
        image.startsWith('/images') || 
        image.startsWith('/api')) {
      return `${baseUrl}${image}`;
    }
    
    // If it's just a filename (no path), assume it's in /uploads
    if (!image.includes('/') && !image.includes('\\')) {
      return `${baseUrl}/uploads/${image}`;
    }
    
    // If it's a relative path without leading slash
    if (!image.startsWith('/')) {
      return `${baseUrl}/${image}`;
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
      return resolveImageUrl(image.public_id);
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
 * @param {Array|Object} images - Images array or object
 * @returns {string|null} - First valid image URL or null
 */
export const getFirstImage = (images) => {
  if (!images) return null;
  
  if (Array.isArray(images) && images.length > 0) {
    return resolveImageUrl(images[0]);
  }
  
  if (typeof images === 'object') {
    // Try to get first value from object
    const values = Object.values(images);
    if (values.length > 0) {
      return resolveImageUrl(values[0]);
    }
  }
  
  return null;
};

/**
 * Get all valid image URLs from a property
 * @param {Array|Object} images - Images array or object
 * @returns {Array} - Array of valid image URLs
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
 * @param {string} url - Image URL to check
 * @returns {boolean} - True if URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      new URL(url);
      return true;
    }
    // Check for data URLs
    if (url.startsWith('data:image/')) {
      return true;
    }
    // Check for blob URLs
    if (url.startsWith('blob:')) {
      return true;
    }
    // Check for base64
    if (url.startsWith('/9j/') || url.startsWith('iVBOR')) {
      return true;
    }
    // Accept relative paths
    if (url.startsWith('/') || url.startsWith('./')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Get a placeholder image URL
 * @param {string} text - Optional text to display on placeholder
 * @param {number} width - Width of placeholder
 * @param {number} height - Height of placeholder
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (text = 'No Image', width = 400, height = 300) => {
  // Using UI Avatars for placeholder
  const encodedText = encodeURIComponent(text);
  return `https://ui-avatars.com/api/?name=${encodedText}&background=random&size=${width}&color=fff&font-size=0.5`;
};

/**
 * Get a property image or placeholder
 * @param {Array|Object|string} image - Image data
 * @param {string} fallbackText - Fallback text for placeholder
 * @returns {string} - Image URL or placeholder
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
 * @param {string} url - Original URL
 * @param {string} fallback - Fallback URL
 * @returns {string} - URL or fallback
 */
export const getImageWithFallback = (url, fallback = '/images/placeholder.jpg') => {
  const resolved = resolveImageUrl(url);
  if (resolved && isValidImageUrl(resolved)) {
    return resolved;
  }
  return fallback;
};

/**
 * Optimize image URL for different sizes (useful for Cloudinary, etc.)
 * @param {string} url - Original URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.quality - Image quality (low, medium, high)
 * @param {string} options.format - Image format (webp, jpg, png)
 * @returns {string} - Optimized URL
 */
export const optimizeImage = (url, options = {}) => {
  const { width, height, quality = 'medium', format = 'webp' } = options;
  
  // Only apply to Cloudinary URLs
  if (url && url.includes('cloudinary.com')) {
    let optimizedUrl = url;
    
    // Add transformation parameters
    const params = [];
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    if (quality === 'low') params.push('q_auto:low');
    else if (quality === 'medium') params.push('q_auto');
    else if (quality === 'high') params.push('q_auto:best');
    if (format) params.push(`f_${format}`);
    
    if (params.length > 0) {
      // Insert transformation before image version
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
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
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

// Default export for convenience
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
};