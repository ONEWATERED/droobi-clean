import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CredentialsPage from '../credentials/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Credentials Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'c1',
          userId: 'u1',
          name: 'PE – Civil',
          issuer: 'State Board',
          licenseNo: 'PE-123456',
          issuedAt: '2022-05-10',
          expiresAt: '2026-05-10',
          notes: 'Renew 90 days prior',
          status: 'active'
        },
        {
          id: 'c2',
          userId: 'u1',
          name: 'Confined Space Training',
          issuer: 'OSHA',
          issuedAt: '2024-03-01',
          expiresAt: '2025-03-01',
          notes: '',
          status: 'expiringSoon'
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render credentials page with title', async () => {
    render(<CredentialsPage />);
    
    expect(screen.getByText('Credentials')).toBeInTheDocument();
    expect(screen.getByText('Manage your professional licenses, certifications, and qualifications')).toBeInTheDocument();
  });

  it('should load and display credentials', async () => {
    render(<CredentialsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('PE – Civil')).toBeInTheDocument();
      expect(screen.getByText('Confined Space Training')).toBeInTheDocument();
      expect(screen.getByText('State Board')).toBeInTheDocument();
      expect(screen.getByText('PE-123456')).toBeInTheDocument();
    });
  });

  it('should show status badges with appropriate colors', async () => {
    render(<CredentialsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('expiringSoon')).toBeInTheDocument();
    });
  });

  it('should show add credential button', async () => {
    render(<CredentialsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Credential')).toBeInTheDocument();
    });
  });

  it('should show quick links to resume and business card', async () => {
    render(<CredentialsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Resume Management')).toBeInTheDocument();
      expect(screen.getByText('Business Card')).toBeInTheDocument();
      expect(screen.getByText('Manage Resume')).toBeInTheDocument();
      expect(screen.getByText('Edit Business Card')).toBeInTheDocument();
    });
  });

  it('should show empty state when no credentials', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<CredentialsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No credentials yet')).toBeInTheDocument();
      expect(screen.getByText('Add your professional licenses and certifications to track expiration dates.')).toBeInTheDocument();
      expect(screen.getByText('Add Your First Credential')).toBeInTheDocument();
    });
  });

  it('should open add credential dialog when button clicked', async () => {
    render(<CredentialsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Credential')).toBeInTheDocument();
    });

    // Click add button
    const addButton = screen.getByText('Add Credential');
    fireEvent.click(addButton);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Add New Credential')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., PE – Civil')).toBeInTheDocument();
    });
  });
});