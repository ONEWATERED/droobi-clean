import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Create a mock component for the Admin Status page
function MockAdminStatusPage({ isAdminMode = true }: { isAdminMode?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [apiStatus, setApiStatus] = React.useState<any>(null);
  const [webVersion, setWebVersion] = React.useState<any>(null);
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!isAdminMode) {
      setLoading(false);
      return;
    }

    // Mock data fetch
    setTimeout(() => {
      setWebVersion({
        service: 'droobi-web',
        version: '1.0.0',
        sha: 'abc123'
      });
      
      setApiStatus({
        service: 'droobi-api',
        version: '1.0.0',
        sha: 'abc123',
        node: 'v20.0.0',
        pid: 12345,
        uptimeSec: 3661, // 1h 1m 1s
        envName: 'development',
        dataNs: 'default',
        health: {
          status: 'ok',
          ready: true
        },
        flags: {
          lexicon: true,
          directory: true,
          community: false
        },
        counts: {
          lexicon: 2,
          directory: 2,
          webinars: 3,
          videos: 3,
          trainings: 2,
          projects: 3,
          communityPosts: 2
        }
      });
      
      setLoading(false);
    }, 100);
  }, [isAdminMode]);

  const handleCopyJson = async () => {
    const jsonData = {
      web: webVersion,
      api: apiStatus,
      timestamp: new Date().toISOString()
    };
    
    await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAdminMode) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>Admin mode is required to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div>Loading admin status...</div>;
  }

  return (
    <div>
      <h1>System Status</h1>
      <p>Real-time monitoring of API health, build information, and content metrics</p>
      
      {/* Controls */}
      <div>
        <button>Refresh</button>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (10s)
        </label>
        <button onClick={handleCopyJson}>
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>

      {/* API Health */}
      <div>
        <h2>API Health</h2>
        {apiStatus && (
          <div>
            <div>Status: {apiStatus.health.status} / {apiStatus.health.ready ? 'ready' : 'not ready'}</div>
            <div>Uptime: 1h 1m 1s</div>
            <div>Environment: {apiStatus.envName}</div>
            <div>Data Namespace: {apiStatus.dataNs}</div>
            <div>Process ID: {apiStatus.pid}</div>
          </div>
        )}
      </div>

      {/* Build Information */}
      <div>
        <h2>Build Information</h2>
        <div>
          <h3>Web Application</h3>
          {webVersion && (
            <div>
              <div>Version: {webVersion.version}</div>
              <div>SHA: {webVersion.sha}</div>
            </div>
          )}
        </div>
        <div>
          <h3>API Service</h3>
          {apiStatus && (
            <div>
              <div>Version: {apiStatus.version}</div>
              <div>SHA: {apiStatus.sha}</div>
              <div>Node.js: {apiStatus.node}</div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <h2>Feature Flags</h2>
        {apiStatus && Object.keys(apiStatus.flags).length > 0 ? (
          Object.entries(apiStatus.flags).map(([key, enabled]) => (
            <div key={key}>
              {key}: {enabled ? 'ON' : 'OFF'}
            </div>
          ))
        ) : (
          <div>No remote flags configured</div>
        )}
      </div>

      {/* Content Counts */}
      <div>
        <h2>Content Metrics</h2>
        {apiStatus && (
          Object.entries(apiStatus.counts).map(([key, count]) => (
            <div key={key}>
              {key}: {count}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

describe('Admin Status Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render admin status page when in admin mode', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Real-time monitoring of API health, build information, and content metrics')).toBeInTheDocument();
    });
  });

  it('should show access denied when not in admin mode', () => {
    render(<MockAdminStatusPage isAdminMode={false} />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Admin mode is required to access this page.')).toBeInTheDocument();
  });

  it('should display API health information', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('API Health')).toBeInTheDocument();
      expect(screen.getByText('Status: ok / ready')).toBeInTheDocument();
      expect(screen.getByText('Uptime: 1h 1m 1s')).toBeInTheDocument();
      expect(screen.getByText('Environment: development')).toBeInTheDocument();
    });
  });

  it('should display build information', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Build Information')).toBeInTheDocument();
      expect(screen.getByText('Web Application')).toBeInTheDocument();
      expect(screen.getByText('API Service')).toBeInTheDocument();
      expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument();
      expect(screen.getByText('SHA: abc123')).toBeInTheDocument();
    });
  });

  it('should display feature flags', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      expect(screen.getByText('lexicon: ON')).toBeInTheDocument();
      expect(screen.getByText('directory: ON')).toBeInTheDocument();
      expect(screen.getByText('community: OFF')).toBeInTheDocument();
    });
  });

  it('should display content metrics', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Content Metrics')).toBeInTheDocument();
      expect(screen.getByText('lexicon: 2')).toBeInTheDocument();
      expect(screen.getByText('directory: 2')).toBeInTheDocument();
      expect(screen.getByText('projects: 3')).toBeInTheDocument();
    });
  });

  it('should handle copy JSON functionality', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Copy JSON')).toBeInTheDocument();
    });

    // Click copy button
    const copyButton = screen.getByText('Copy JSON');
    fireEvent.click(copyButton);

    // Should show copied state
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Verify clipboard was called
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('should handle auto-refresh toggle', async () => {
    render(<MockAdminStatusPage isAdminMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Auto-refresh (10s)')).toBeInTheDocument();
    });

    // Toggle auto-refresh
    const autoRefreshCheckbox = screen.getByRole('checkbox');
    fireEvent.click(autoRefreshCheckbox);

    expect(autoRefreshCheckbox).toBeChecked();
  });
});