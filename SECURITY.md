# Security

This document outlines the security measures implemented in the Droobi Clean platform.

## Environment Variables

### CORS Configuration
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (default: `http://localhost:3000` in development)
- Example: `ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com`

### Rate Limiting
- `RATE_LIMIT_GLOBAL_PER_MIN` - Global requests per minute per IP (default: 120)
- `RATE_LIMIT_MUTATING_PER_MIN` - POST/PATCH/DELETE requests per minute per IP (default: 30)

### Request Size Limits
- `BODY_LIMIT_BYTES` - Maximum request body size in bytes (default: 1048576 = 1MB)

### Content Security Policy
- `NEXT_PUBLIC_CSP_SELF` - CSP self directive (default: `'self'`)

## Backend Security (API)

### CORS Policy
The API implements a strict CORS policy:
- Only origins listed in `ALLOWED_ORIGINS` are permitted
- In development, localhost origins are automatically allowed
- Credentials are supported for authenticated requests
- Preflight requests are handled properly

### Rate Limiting
Two-tier rate limiting system:
- **Global limit**: 120 requests per minute per IP (configurable)
- **Mutating operations**: 30 requests per minute per IP for POST/PATCH/DELETE (configurable)
- Rate limit headers included in responses
- Custom error responses with retry-after information

### Request Validation
All user inputs are validated using Zod schemas:

#### Webinar Registration
```typescript
{
  name: string (1-100 chars),
  email: valid email (max 255 chars)
}
```

#### Community Posts
```typescript
{
  title: string (1-200 chars),
  body: string (1-10000 chars),
  tags?: string[] (max 10 tags, each 1-50 chars)
}
```

#### Comments
```typescript
{
  text: string (1-2000 chars)
}
```

#### Profile Updates
```typescript
{
  name?: string (1-100 chars),
  title?: string (max 200 chars),
  bio?: string (max 2000 chars),
  skills?: string[] (max 20 skills, each 1-50 chars),
  avatarUrl?: valid URL or empty string,
  socials?: {
    linkedin?: valid URL or empty string,
    x?: valid URL or empty string
  }
}
```

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`
- Request ID tracking for audit trails

### Error Handling
- Stack traces are never exposed in production
- All errors include request IDs for tracking
- Generic error messages prevent information leakage
- Structured error responses with consistent format

## Frontend Security (Web)

### Content Security Policy
Strict CSP applied in production:
- `default-src 'self'` - Only allow same-origin resources
- `script-src 'self' 'unsafe-eval'` - Scripts from same origin (Next.js requires unsafe-eval)
- `style-src 'self' 'unsafe-inline'` - Styles from same origin (Tailwind requires unsafe-inline)
- `img-src 'self' data: https:` - Images from same origin, data URLs, and HTTPS
- `connect-src 'self' ${API_URL}` - API connections to configured backend
- `media-src 'self' https:` - Media from same origin and HTTPS
- `object-src 'none'` - No object/embed elements
- `frame-ancestors 'none'` - Prevent framing
- `upgrade-insecure-requests` - Force HTTPS in production

### HTML Sanitization
All user-generated HTML content is sanitized:

#### Standard Sanitization (aboutHtml, rich content)
Allows: `p`, `br`, `strong`, `em`, `b`, `i`, `u`, `h1-h6`, `ul`, `ol`, `li`, `a`, `blockquote`, `code`, `pre`

#### User Content Sanitization (comments, posts)
More restrictive: `p`, `br`, `strong`, `em`, `b`, `i`, `a`

#### Link Safety
- External links automatically get `target="_blank"` and `rel="noopener noreferrer"`
- Only `http`, `https`, and `mailto` schemes allowed
- Malicious JavaScript URLs are stripped

### Security Headers
Applied via middleware and Next.js config:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Adding New Validation

When adding new API endpoints that accept user input:

1. **Create Zod Schema**:
```typescript
// In apps/backend/api/src/security/validation.ts
export const newFeatureSchema = z.object({
  field: z.string().min(1).max(100),
  // ... other fields
});
```

2. **Apply Validation**:
```typescript
// In your route handler
const validation = validateRequest(newFeatureSchema, req.body);
if (!validation.success) {
  return reply.status(400).send({ 
    error: validation.error,
    requestId: req.headers['x-request-id']
  });
}
const { field } = validation.data;
```

3. **Add Rate Limiting** (for mutating operations):
```typescript
app.post('/your-endpoint', async (req, reply) => {
  // ... handler logic
}, {
  config: {
    rateLimit: {
      max: Number(process.env.RATE_LIMIT_MUTATING_PER_MIN || 30),
      timeWindow: '1 minute'
    }
  }
});
```

## Security Testing

### Backend Tests
- CORS origin validation
- Rate limiting enforcement
- Input validation with various payloads
- Security header presence
- Error response format

### Frontend Tests
- HTML sanitization with XSS payloads
- CSP compliance
- Security header validation
- Safe link handling

## Production Considerations

### Environment Setup
- Set `ALLOWED_ORIGINS` to your production domains only
- Configure appropriate rate limits based on expected traffic
- Enable all security headers
- Use HTTPS for all external communications

### Monitoring
- Monitor rate limit violations
- Track validation failures
- Alert on security header bypass attempts
- Log CORS violations for analysis

### Regular Updates
- Keep dependencies updated for security patches
- Review and update CSP as needed
- Audit validation schemas for new attack vectors
- Test security measures regularly

## Reporting Security Issues

If you discover a security vulnerability, please:
1. Do not open a public issue
2. Email security concerns to the support email
3. Include detailed reproduction steps
4. Allow time for investigation and patching

## Compliance

This security implementation provides:
- Protection against common web vulnerabilities (XSS, CSRF, clickjacking)
- Input validation and sanitization
- Rate limiting to prevent abuse
- Secure headers following OWASP recommendations
- Audit trail with request ID tracking