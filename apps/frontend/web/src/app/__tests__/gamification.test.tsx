import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GamificationPage from '../gamification/page';

// Mock fetch
global.fetch = jest.fn();

describe('Gamification Page', () => {
  beforeEach(() => {
    // Mock all API calls
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ points: 150 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'b1',
            name: 'Early Adopter',
            icon: 'Sparkles',
            description: 'First 5 actions',
            criteria: { type: 'events', threshold: 5 }
          }
        ])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { userId: 'u2', points: 200 },
          { userId: 'u1', points: 150 },
          { userId: 'u3', points: 100 }
        ])
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render gamification page with title', async () => {
    render(<GamificationPage />);
    
    expect(screen.getByText('Gamification')).toBeInTheDocument();
    expect(screen.getByText('Track your progress, earn badges, and compete on the leaderboard')).toBeInTheDocument();
  });

  it('should load and display user points', async () => {
    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Total Points Earned')).toBeInTheDocument();
    });
  });

  it('should load and display user badges', async () => {
    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Early Adopter')).toBeInTheDocument();
      expect(screen.getByText('First 5 actions')).toBeInTheDocument();
    });
  });

  it('should load and display leaderboard', async () => {
    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
      expect(screen.getByText('You (u1)')).toBeInTheDocument();
      expect(screen.getByText('u2')).toBeInTheDocument();
      expect(screen.getByText('200 points')).toBeInTheDocument();
    });
  });

  it('should show point earning rules', async () => {
    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('How to Earn Points')).toBeInTheDocument();
      expect(screen.getByText('Register for webinar')).toBeInTheDocument();
      expect(screen.getByText('+10')).toBeInTheDocument();
      expect(screen.getByText('Create community post')).toBeInTheDocument();
      expect(screen.getByText('+8')).toBeInTheDocument();
    });
  });

  it('should show badge requirements', async () => {
    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Badge Requirements')).toBeInTheDocument();
      expect(screen.getByText('5 actions')).toBeInTheDocument();
      expect(screen.getByText('3 comments')).toBeInTheDocument();
      expect(screen.getByText('5 modules')).toBeInTheDocument();
    });
  });

  it('should show admin form when in admin mode', async () => {
    // Mock admin mode
    const originalEnv = process.env.NEXT_PUBLIC_ADMIN_MODE;
    process.env.NEXT_PUBLIC_ADMIN_MODE = '1';
    
    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin: Award Points')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter user ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter points amount')).toBeInTheDocument();
    });
    
    // Restore original env
    process.env.NEXT_PUBLIC_ADMIN_MODE = originalEnv;
  });

  it('should handle admin points award', async () => {
    // Mock admin mode
    const originalEnv = process.env.NEXT_PUBLIC_ADMIN_MODE;
    process.env.NEXT_PUBLIC_ADMIN_MODE = '1';
    
    // Mock the award points API call
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ points: 150 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ points: 175 })
      });

    render(<GamificationPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Admin: Award Points')).toBeInTheDocument();
    });

    // Fill form
    const userIdInput = screen.getByPlaceholderText('Enter user ID');
    const amountInput = screen.getByPlaceholderText('Enter points amount');
    
    fireEvent.change(userIdInput, { target: { value: 'u2' } });
    fireEvent.change(amountInput, { target: { value: '25' } });

    // Submit form
    const awardButton = screen.getByText('Award Points');
    fireEvent.click(awardButton);

    // Verify API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/points',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin': '1'
          },
          body: expect.stringContaining('u2')
        })
      );
    });
    
    // Restore original env
    process.env.NEXT_PUBLIC_ADMIN_MODE = originalEnv;
  });

  it('should show empty state for no badges', async () => {
    // Mock empty badges response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ points: 0 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(<GamificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No badges earned yet')).toBeInTheDocument();
      expect(screen.getByText('Complete activities to earn your first badge!')).toBeInTheDocument();
    });
  });
});