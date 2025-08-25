import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommunityPage from '../community/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Community Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'c1',
          authorId: 'u1',
          title: 'Welcome to the Community',
          body: 'Kick off thread — introduce yourself!',
          tags: ['intro'],
          createdAt: 1735776000000
        },
        {
          id: 'c2',
          authorId: 'u2',
          title: 'PFAS resources',
          body: 'Share articles, pilots, and case studies here.',
          tags: ['pfas', 'drinking-water'],
          createdAt: 1735862400000
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render community page with title', async () => {
    render(<CommunityPage />);
    
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Share knowledge, ask questions, and connect with the water technology community')).toBeInTheDocument();
  });

  it('should render search and new post button', async () => {
    render(<CommunityPage />);
    
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
    expect(screen.getByText('New Post')).toBeInTheDocument();
  });

  it('should load and display posts', async () => {
    render(<CommunityPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to the Community')).toBeInTheDocument();
      expect(screen.getByText('PFAS resources')).toBeInTheDocument();
    });
  });

  it('should perform search when search button is clicked', async () => {
    render(<CommunityPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Welcome to the Community')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'Welcome' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Verify search was called with query parameter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/community/posts?q=Welcome');
    });
  });

  it('should show post details and read buttons', async () => {
    render(<CommunityPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to the Community')).toBeInTheDocument();
      expect(screen.getByText('Kick off thread — introduce yourself!')).toBeInTheDocument();
      expect(screen.getByText('intro')).toBeInTheDocument();
    });

    // Check for read buttons
    const readButtons = screen.getAllByText('Read & Comment');
    expect(readButtons.length).toBeGreaterThan(0);
  });

  it('should display tags as badges', async () => {
    render(<CommunityPage />);
    
    await waitFor(() => {
      expect(screen.getByText('intro')).toBeInTheDocument();
      expect(screen.getByText('pfas')).toBeInTheDocument();
      expect(screen.getByText('drinking-water')).toBeInTheDocument();
    });
  });
});