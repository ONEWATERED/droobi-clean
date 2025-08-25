import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectsPage from '../projects/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Projects Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'p1',
            title: 'Lift Station Upgrades – Phase 2',
            source: 'SAM.gov',
            status: 'open',
            publishedAt: '2025-09-01T12:00:00Z',
            dueAt: '2025-10-01T21:00:00Z',
            buyer: 'City of Example',
            category: 'Wastewater',
            region: 'US-SE',
            summary: 'Pump replacements, controls, SCADA integration.',
            url: 'https://sam.example.gov/opportunity/12345'
          }
        ])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render projects page with title', async () => {
    render(<ProjectsPage />);
    
    expect(screen.getByText('RFP & Project Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Discover and track water infrastructure projects and procurement opportunities')).toBeInTheDocument();
  });

  it('should render search and filter form', async () => {
    render(<ProjectsPage />);
    
    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();
  });

  it('should load and display projects', async () => {
    render(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Lift Station Upgrades – Phase 2')).toBeInTheDocument();
      expect(screen.getByText('City of Example')).toBeInTheDocument();
      expect(screen.getByText('SAM.gov')).toBeInTheDocument();
    });
  });

  it('should perform search when search button is clicked', async () => {
    render(<ProjectsPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Lift Station Upgrades – Phase 2')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'Lift Station' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Verify search was called with query parameter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/projects?q=Lift+Station');
    });
  });

  it('should show project details and action buttons', async () => {
    render(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Lift Station Upgrades – Phase 2')).toBeInTheDocument();
      expect(screen.getByText('Pump replacements, controls, SCADA integration.')).toBeInTheDocument();
      expect(screen.getByText('open')).toBeInTheDocument();
    });

    // Check for action buttons
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
  });
});