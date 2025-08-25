import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrainingsPage from '../trainings/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Trainings Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 't1',
          title: 'AI for One Water – Basics',
          level: 'beginner',
          durationMin: 60,
          tags: ['ai', 'one-water'],
          publishedAt: '2025-09-12T15:00:00Z',
          description: 'Foundations, use cases, and pitfalls.',
          lessons: [
            { id: 'l1', title: 'What is AI?', durationMin: 10 },
            { id: 'l2', title: 'Agent basics', durationMin: 20 },
            { id: 'l3', title: 'Utility examples', durationMin: 30 }
          ]
        },
        {
          id: 't2',
          title: 'Permitting Agents – Practitioner Track',
          level: 'intermediate',
          durationMin: 90,
          tags: ['agents', 'permitting'],
          publishedAt: '2025-09-19T16:00:00Z',
          description: 'Hands-on with workflows and QA.',
          lessons: [
            { id: 'l1', title: 'Reg frameworks', durationMin: 25 },
            { id: 'l2', title: 'Agent workflow design', durationMin: 35 },
            { id: 'l3', title: 'Failure modes & fixes', durationMin: 30 }
          ]
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render trainings page with title', async () => {
    render(<TrainingsPage />);
    
    expect(screen.getByText('Training Courses')).toBeInTheDocument();
    expect(screen.getByText('Structured learning paths for water technology and AI implementation')).toBeInTheDocument();
  });

  it('should render search and filter form', async () => {
    render(<TrainingsPage />);
    
    expect(screen.getByPlaceholderText('Search trainings...')).toBeInTheDocument();
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();
  });

  it('should load and display trainings', async () => {
    render(<TrainingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('AI for One Water – Basics')).toBeInTheDocument();
      expect(screen.getByText('Permitting Agents – Practitioner Track')).toBeInTheDocument();
    });
  });

  it('should perform search when search button is clicked', async () => {
    render(<TrainingsPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('AI for One Water – Basics')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search trainings...');
    fireEvent.change(searchInput, { target: { value: 'AI' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Verify search was called with query parameter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/trainings?q=AI');
    });
  });

  it('should show training details and course links', async () => {
    render(<TrainingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('AI for One Water – Basics')).toBeInTheDocument();
      expect(screen.getByText('Foundations, use cases, and pitfalls.')).toBeInTheDocument();
      expect(screen.getByText('1h • 3 lessons')).toBeInTheDocument();
      expect(screen.getByText('beginner')).toBeInTheDocument();
    });

    // Check for course links
    const courseLinks = screen.getAllByText('View Course');
    expect(courseLinks.length).toBeGreaterThan(0);
  });

  it('should display level badges and tags', async () => {
    render(<TrainingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('beginner')).toBeInTheDocument();
      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('ai')).toBeInTheDocument();
      expect(screen.getByText('agents')).toBeInTheDocument();
    });
  });
});