/**
 * Strip leading './' from path.
 *
 * If {@code path} is not a string, a warning is logged and an empty string is returned.
 *
 * @param {*} path
 * @returns {string} The path without a leading "./", or an empty string if {@code path} is not a string.
 */
export function stripLeadingDotSlash(path) {
  if (typeof path !== 'string') {
    console.warn('stripLeadingDotSlash: provided path is not a string');
    return '';
  }
  return path.replace(/^\.\//, '');
}

/**
 * Check if text is an HTML document
 * @param {string} text 
 * @returns {boolean}
 */
export function isHTMLDocument(text) {
  if (typeof text !== 'string') {
    return false;
  }

  const trimmed = text.trimStart();

  // Note: this is a lightweight heuristic and does not attempt to validate a
  // full HTML document; it only looks for common document‑level markers.
  return /^<\s*!DOCTYPE\s+html\b/i.test(trimmed) ||
         /^<\s*html[\s>]/i.test(trimmed);
}
