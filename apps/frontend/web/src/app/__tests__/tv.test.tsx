import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TVPage from '../tv/page';

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

describe('TV Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'v1',
          title: 'Welcome to Droobi TV',
          description: 'Kickoff reel for the platform.',
          url: 'https://storage.example.com/videos/welcome.mp4',
          poster: 'https://storage.example.com/posters/welcome.jpg',
          tags: ['intro', 'platform'],
          publishedAt: '2025-09-01T12:00:00Z',
          durationSec: 90
        },
        {
          id: 'v2',
          title: 'AI for One Water – Highlights',
          description: 'Key moments from our webinar series.',
          url: 'https://storage.example.com/videos/ai-one-water.mp4',
          poster: '',
          tags: ['ai', 'one-water'],
          publishedAt: '2025-09-05T15:00:00Z',
          durationSec: 300
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render TV page with title', async () => {
    render(<TVPage />);
    
    expect(screen.getByText('Droobi TV')).toBeInTheDocument();
    expect(screen.getByText('Watch educational content, demos, and highlights from our platform')).toBeInTheDocument();
  });

  it('should render search and filter form', async () => {
    render(<TVPage />);
    
    expect(screen.getByPlaceholderText('Search videos...')).toBeInTheDocument();
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();
  });

  it('should load and display videos', async () => {
    render(<TVPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to Droobi TV')).toBeInTheDocument();
      expect(screen.getByText('AI for One Water – Highlights')).toBeInTheDocument();
    });
  });

  it('should perform search when search button is clicked', async () => {
    render(<TVPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Droobi TV')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search videos...');
    fireEvent.change(searchInput, { target: { value: 'Welcome' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Verify search was called with query parameter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/videos?q=Welcome');
    });
  });

  it('should show video details and watch links', async () => {
    render(<TVPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to Droobi TV')).toBeInTheDocument();
      expect(screen.getByText('Kickoff reel for the platform.')).toBeInTheDocument();
      expect(screen.getByText('1:30')).toBeInTheDocument(); // Duration formatted
    });

    // Check for watch links
    const watchLinks = screen.getAllByText('Watch');
    expect(watchLinks.length).toBeGreaterThan(0);
  });

  it('should display tags as badges', async () => {
    render(<TVPage />);
    
    await waitFor(() => {
      expect(screen.getByText('intro')).toBeInTheDocument();
      expect(screen.getByText('platform')).toBeInTheDocument();
      expect(screen.getByText('ai')).toBeInTheDocument();
      expect(screen.getByText('one-water')).toBeInTheDocument();
    });
  });
});