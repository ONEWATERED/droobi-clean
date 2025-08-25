import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoungePage from '../lounge/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Lounge Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'r1',
          name: 'General Lounge',
          description: 'Open chat for everyone'
        },
        {
          id: 'r2',
          name: 'Vendors & Utilities',
          description: 'Partner intros and Q&A'
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render lounge page with title', async () => {
    render(<LoungePage />);
    
    expect(screen.getByText('Community Lounge')).toBeInTheDocument();
    expect(screen.getByText('Connect with peers, share insights, and collaborate in real-time chat rooms')).toBeInTheDocument();
  });

  it('should load and display chat rooms', async () => {
    render(<LoungePage />);
    
    await waitFor(() => {
      expect(screen.getByText('General Lounge')).toBeInTheDocument();
      expect(screen.getByText('Vendors & Utilities')).toBeInTheDocument();
    });
  });

  it('should show join chat buttons', async () => {
    render(<LoungePage />);
    
    await waitFor(() => {
      const joinButtons = screen.getAllByText('Join Chat');
      expect(joinButtons.length).toBe(2);
    });
  });

  it('should show admin create button when in admin mode', async () => {
    // Mock admin mode
    const originalEnv = process.env.NEXT_PUBLIC_ADMIN_MODE;
    process.env.NEXT_PUBLIC_ADMIN_MODE = '1';
    
    render(<LoungePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Room (Coming Soon)')).toBeInTheDocument();
    });
    
    // Restore original env
    process.env.NEXT_PUBLIC_ADMIN_MODE = originalEnv;
  });
});