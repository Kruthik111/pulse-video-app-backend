/**
 * Utility to get the absolute URL for a media asset
 * @param {Object} req - Express request object
 * @param {string} relativePath - The stored relative path (e.g. /uploads/abc.mp4)
 * @returns {string} - Full absolute URL
 */
const getAbsoluteUrl = (req, relativePath) => {
  if (!relativePath) return null;
  
  // If it's already an absolute URL (starts with http), return as is
  if (relativePath.startsWith('http')) return relativePath;
  
  const protocol = req.protocol;
  const host = req.get('host');
  
  // Combine to form full URL
  // Ensure we don't have double slashes if relativePath also starts with /
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  
  return `${protocol}://${host}/${cleanPath}`;
};

module.exports = { getAbsoluteUrl };
