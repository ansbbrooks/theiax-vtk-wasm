/**
 * Create a blob URL from provided buffer and mime type
 * @param {ArrayBufferLike} buffer
 * @param {string} mimeType 
 * @returns {string} blob URL
 */
export function createBlobURL(buffer, mimeType) {
  return URL.createObjectURL(new Blob([buffer], { type: mimeType }));
}

/**
 * Dispose a blob URL
 * @param {string} url 
 */
export function disposeBlobURL(url) {
  // URL.revokeObjectURL is a no-op for non-blob URLs
  URL.revokeObjectURL(url);
}
