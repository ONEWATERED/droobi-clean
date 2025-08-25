interface PublicAppSettings {
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
  social: {
    x: string;
    linkedin: string;
    youtube: string;
  };
  footerLinks: Array<{
    label: string;
    href: string;
  }>;
  aboutHtml: string;
}

// Parse environment settings as fallback
function parseEnvSettings(): PublicAppSettings {
  return {
    brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'Droobi',
    brandTagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'One Water. One Platform.',
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || '',
    termsUrl: process.env.NEXT_PUBLIC_TERMS_URL || '',
    social: {
      x: process.env.NEXT_PUBLIC_SOCIAL_X || '',
      linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '',
      youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || ''
    },
    footerLinks: [
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: 'https://example.com/privacy' },
      { label: 'Terms', href: 'https://example.com/terms' }
    ],
    aboutHtml: '<p>Droobi accelerates One Water collaboration: vendors, utilities, projects, and learning in one place.</p>'
  };
}

// Fetch remote settings if enabled
async function fetchRemoteSettings(): Promise<PublicAppSettings | null> {
  if (process.env.NEXT_PUBLIC_REMOTE_SETTINGS !== '1') {
    return null;
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/public/app-settings`, { cache: 'no-store' });
    
    if (!response.ok) {
      console.warn('Failed to fetch remote settings, using environment fallback');
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.warn('Error fetching remote settings:', error);
    return null;
  }
}

// Get effective app settings (remote overrides environment)
export async function getEffectiveSettings(): Promise<PublicAppSettings> {
  const envSettings = parseEnvSettings();
  const remoteSettings = await fetchRemoteSettings();
  
  return remoteSettings ? { ...envSettings, ...remoteSettings } : envSettings;
}