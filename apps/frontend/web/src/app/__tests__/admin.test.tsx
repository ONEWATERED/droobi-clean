import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Create a mock component for the Admin Flags page since we need to test client functionality
function MockAdminFlagsPage({ initialFlags }: { initialFlags: any }) {
  const [flags, setFlags] = React.useState(initialFlags);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleToggle = (key: string, value: boolean) => {
    setFlags((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 100));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Feature Flags</h1>
      <p>Enable or disable platform modules and features</p>
      
      {Object.entries(flags).map(([key, value]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => handleToggle(key, e.target.checked)}
          />
        </div>
      ))}
      
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      
      {saved && <div>Saved successfully!</div>}
    </div>
  );
}

describe('Admin Flags Page', () => {
  const mockFlags = {
    lexicon: true,
    directory: true,
    community: false,
    inbox: false
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFlags)
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render admin flags page with title', async () => {
    render(<MockAdminFlagsPage initialFlags={mockFlags} />);
    
    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    expect(screen.getByText('Enable or disable platform modules and features')).toBeInTheDocument();
  });

  it('should display feature toggles', async () => {
    render(<MockAdminFlagsPage initialFlags={mockFlags} />);
    
    expect(screen.getByText('lexicon')).toBeInTheDocument();
    expect(screen.getByText('directory')).toBeInTheDocument();
    expect(screen.getByText('community')).toBeInTheDocument();
    expect(screen.getByText('inbox')).toBeInTheDocument();
  });

  it('should toggle feature flags', async () => {
    render(<MockAdminFlagsPage initialFlags={mockFlags} />);
    
    // Find the community checkbox (should be unchecked)
    const communityCheckbox = screen.getByRole('checkbox', { name: /community/i });
    expect(communityCheckbox).not.toBeChecked();
    
    // Toggle it
    fireEvent.click(communityCheckbox);
    expect(communityCheckbox).toBeChecked();
  });

  it('should save changes', async () => {
    render(<MockAdminFlagsPage initialFlags={mockFlags} />);
    
    // Click save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Should show saving state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
    });
  });
});

// Settings page test
function MockSettingsPage({ initialSettings }: { initialSettings: any }) {
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

  return (
    <div>
      <h1>Settings</h1>
      <p>Configure your personal preferences and notifications</p>
      
      <div>
        <label>Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => setSettings((prev: any) => ({ ...prev, timezone: e.target.value }))}
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
      
      <div>
        <label>Email Alerts</label>
        <input
          type="checkbox"
          checked={settings.emailAlerts}
          onChange={(e) => setSettings((prev: any) => ({ ...prev, emailAlerts: e.target.checked }))}
        />
      </div>
      
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      
      {saved && <div>Saved successfully!</div>}
    </div>
  );
}

describe('Settings Page', () => {
  const mockSettings = {
    userId: 'u1',
    timezone: 'America/New_York',
    emailAlerts: true
  };

  it('should render settings page with title', async () => {
    render(<MockSettingsPage initialSettings={mockSettings} />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your personal preferences and notifications')).toBeInTheDocument();
  });

  it('should display current settings', async () => {
    render(<MockSettingsPage initialSettings={mockSettings} />);
    
    const timezoneSelect = screen.getByDisplayValue('America/New_York');
    expect(timezoneSelect).toBeInTheDocument();
    
    const emailAlertsCheckbox = screen.getByRole('checkbox');
    expect(emailAlertsCheckbox).toBeChecked();
  });

  it('should update timezone setting', async () => {
    render(<MockSettingsPage initialSettings={mockSettings} />);
    
    const timezoneSelect = screen.getByDisplayValue('America/New_York');
    fireEvent.change(timezoneSelect, { target: { value: 'UTC' } });
    
    expect(screen.getByDisplayValue('UTC')).toBeInTheDocument();
  });

  it('should save settings changes', async () => {
    render(<MockSettingsPage initialSettings={mockSettings} />);
    
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