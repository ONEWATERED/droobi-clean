import { render, screen } from '@testing-library/react';
import { sanitizeHtml, sanitizeUserHtml } from '@/lib/sanitize';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Security', () => {
  describe('HTML Sanitization', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>world</strong>!</p>';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('<p>Hello <strong>world</strong>!</p>');
    });

    it('should remove dangerous script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('<p>Hello</p>');
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should sanitize malicious attributes', () => {
      const input = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('<p>Click me</p>');
      expect(result).not.toContain('onclick');
    });

    it('should handle external links safely', () => {
      const input = '<a href="https://example.com">External link</a>';
      const result = sanitizeHtml(input);
      
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should preserve internal links', () => {
      const input = '<a href="/internal">Internal link</a>';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('<a href="/internal">Internal link</a>');
      expect(result).not.toContain('target="_blank"');
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
      expect(sanitizeHtml(123 as any)).toBe('');
    });

    it('should be more restrictive for user content', () => {
      const input = '<h1>Title</h1><p>Content</p><blockquote>Quote</blockquote>';
      const result = sanitizeUserHtml(input);
      
      expect(result).toContain('<p>Content</p>');
      expect(result).not.toContain('<h1>');
      expect(result).not.toContain('<blockquote>');
    });
  });

  describe('Security Headers', () => {
    // Note: These tests would need to be integration tests with a real Next.js server
    // For now, we'll test the sanitization logic which is the main security concern
    
    it('should sanitize HTML in components', () => {
      const dangerousHtml = '<p>Safe content</p><script>alert("xss")</script>';
      const safeHtml = sanitizeHtml(dangerousHtml);
      
      // Mock component that uses sanitized HTML
      const TestComponent = () => (
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      );
      
      render(<TestComponent />);
      
      expect(screen.getByText('Safe content')).toBeInTheDocument();
      // Script should be removed
      expect(document.querySelector('script')).toBeNull();
    });
  });
});