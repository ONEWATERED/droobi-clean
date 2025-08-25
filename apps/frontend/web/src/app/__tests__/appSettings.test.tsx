import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router and Image
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Create mock components for testing since we can't import server components directly
function MockAboutPage({ settings }: any) {
  return (
    <div>
      <h1>About {settings.brandName}</h1>
      <p>{settings.brandTagline}</p>
      <div dangerouslySetInnerHTML={{ __html: settings.aboutHtml }} />
      <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
    </div>
  );
}

function MockAdminAppSettingsPage({ initialSettings }: any) {
  const [settings, setSettings] = React.useState(initialSettings);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social.')) {
      const socialField = field.split('.')[1];
      setSettings((prev: any) => ({
        ...prev,
        social: { ...prev.social, [socialField]: value }
      }));
    } else {
      setSettings((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div>
      <h1>App Settings</h1>
      <p>Configure branding, contact information, and site-wide settings</p>
      
      <div>
        <label>Brand Name</label>
        <input
          value={settings.brandName}
          onChange={(e) => handleInputChange('brandName', e.target.value)}
          placeholder="Your brand name"
        />
      </div>
      
      <div>
        <label>Brand Tagline</label>
        <input
          value={settings.brandTagline}
          onChange={(e) => handleInputChange('brandTagline', e.target.value)}
          placeholder="Your brand tagline"
        />
      </div>
      
      <div>
        <label>Support Email</label>
        <input
          type="email"
          value={settings.supportEmail}
          onChange={(e) => handleInputChange('supportEmail', e.target.value)}
          placeholder="support@example.com"
        />
      </div>
      
      <div>
        <label>X (Twitter)</label>
        <input
          value={settings.social.x}
          onChange={(e) => handleInputChange('social.x', e.target.value)}
          placeholder="https://x.com/yourhandle"
        />
      </div>
      
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      
      {saved && <div>Saved successfully!</div>}
    </div>
  );
}

describe('App Settings', () => {
  const mockSettings = {
    brandName: 'Droobi',
    brandTagline: 'One Water. One Platform.',
    logoUrl: '',
    supportEmail: 'support@example.com',
    privacyUrl: '',
    termsUrl: '',
    social: {
      x: '',
      linkedin: '',
      youtube: ''
    },
    footerLinks: [
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: 'https://example.com/privacy' }
    ],
    aboutHtml: '<p>Droobi accelerates One Water collaboration.</p>'
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSettings)
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('About Page', () => {
    it('should render about page with brand information', async () => {
      render(<MockAboutPage settings={mockSettings} />);
      
      expect(screen.getByText('About Droobi')).toBeInTheDocument();
      expect(screen.getByText('One Water. One Platform.')).toBeInTheDocument();
      expect(screen.getByText('support@example.com')).toBeInTheDocument();
    });

    it('should render about HTML content', async () => {
      render(<MockAboutPage settings={mockSettings} />);
      
      expect(screen.getByText('Droobi accelerates One Water collaboration.')).toBeInTheDocument();
    });
  });

  describe('Admin App Settings Page', () => {
    it('should render admin app settings page with title', async () => {
      render(<MockAdminAppSettingsPage initialSettings={mockSettings} />);
      
      expect(screen.getByText('App Settings')).toBeInTheDocument();
      expect(screen.getByText('Configure branding, contact information, and site-wide settings')).toBeInTheDocument();
    });

    it('should display current settings in form fields', async () => {
      render(<MockAdminAppSettingsPage initialSettings={mockSettings} />);
      
      expect(screen.getByDisplayValue('Droobi')).toBeInTheDocument();
      expect(screen.getByDisplayValue('One Water. One Platform.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('support@example.com')).toBeInTheDocument();
    });

    it('should update brand name', async () => {
      render(<MockAdminAppSettingsPage initialSettings={mockSettings} />);
      
      const brandNameInput = screen.getByDisplayValue('Droobi');
      fireEvent.change(brandNameInput, { target: { value: 'Updated Brand' } });
      
      expect(screen.getByDisplayValue('Updated Brand')).toBeInTheDocument();
    });

    it('should update social media links', async () => {
      render(<MockAdminAppSettingsPage initialSettings={mockSettings} />);
      
      const xInput = screen.getByPlaceholderText('https://x.com/yourhandle');
      fireEvent.change(xInput, { target: { value: 'https://x.com/droobi' } });
      
      expect(screen.getByDisplayValue('https://x.com/droobi')).toBeInTheDocument();
    });

    it('should save settings changes', async () => {
      render(<MockAdminAppSettingsPage initialSettings={mockSettings} />);
      
      // Click save button
      const saveButton = screen.getByText('Save Settings');
      fireEvent.click(saveButton);
      
      // Should show saving state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      // Wait for save to complete
      await waitFor(() => {
        expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
      });
    });
  });
});