import sanitizeHtml from 'sanitize-html';

// Safe HTML sanitization options for user content
const sanitizeOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'code', 'pre'
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    '*': ['class'] // Allow class for styling
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    'a': ['http', 'https', 'mailto']
  },
  transformTags: {
    'a': (tagName: string, attribs: any) => {
      // Force external links to open in new tab with security attributes
      if (attribs.href && (attribs.href.startsWith('http://') || attribs.href.startsWith('https://'))) {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
      return { tagName, attribs };
    }
  }
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return sanitizeHtml(html, sanitizeOptions);
}

/**
 * Sanitize HTML with stricter rules for user-generated content
 * @param html - Raw HTML string
 * @returns Sanitized HTML string with minimal allowed tags
 */
export function sanitizeUserHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return sanitizeHtml(html, {
    ...sanitizeOptions,
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'a'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel']
    }
  });
}