import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventsPage from '../events/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Events Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'w1',
          title: 'AI for One Water – Kickoff',
          startsAt: '2025-09-10T15:00:00Z',
          durationMin: 60,
          host: 'Droobi',
          platform: 'zoom',
          description: 'Overview + live Q&A'
        },
        {
          id: 'w2',
          title: 'Permitting Agents 101',
          startsAt: '2025-09-17T16:00:00Z',
          durationMin: 45,
          host: 'Droobi',
          platform: 'meet',
          description: 'Hands-on demo'
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render events page with title', async () => {
    render(<EventsPage />);
    
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('Join our webinars and workshops to learn about the latest in water technology and AI')).toBeInTheDocument();
  });

  it('should render search form', async () => {
    render(<EventsPage />);
    
    expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument();
    expect(screen.getByText('Search Events')).toBeInTheDocument();
  });

  it('should load and display webinars', async () => {
    render(<EventsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('AI for One Water – Kickoff')).toBeInTheDocument();
      expect(screen.getByText('Permitting Agents 101')).toBeInTheDocument();
    });
  });

  it('should perform search when search button is clicked', async () => {
    render(<EventsPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('AI for One Water – Kickoff')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search events...');
    fireEvent.change(searchInput, { target: { value: 'AI' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Verify search was called with query parameter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/webinars?q=AI');
    });
  });

  it('should show event details and registration links', async () => {
    render(<EventsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('AI for One Water – Kickoff')).toBeInTheDocument();
      expect(screen.getByText('Overview + live Q&A')).toBeInTheDocument();
      expect(screen.getByText('60 minutes')).toBeInTheDocument();
      expect(screen.getByText('Hosted by Droobi')).toBeInTheDocument();
    });

    // Check for registration links
    const registrationLinks = screen.getAllByText('View Details & Register');
    expect(registrationLinks.length).toBeGreaterThan(0);
  });
});