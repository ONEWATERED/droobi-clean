import { render, screen } from '@testing-library/react';
import DirectoryPage from '../directory/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Directory Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve([
        {
          slug: 'acme-filtration',
          name: 'Acme Filtration',
          type: 'vendor',
          category: 'Filtration',
          region: 'US-SE',
          about: 'Membrane systems and skid solutions.',
          website: 'https://example.com',
          email: 'info@acme.com'
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render directory page with title', async () => {
    render(<DirectoryPage />);
    
    expect(screen.getByText('Directory')).toBeInTheDocument();
    expect(screen.getByText('Professional contact and resource directory')).toBeInTheDocument();
  });

  it('should render search and filter form', async () => {
    render(<DirectoryPage />);
    
    expect(screen.getByPlaceholderText('Search organizations...')).toBeInTheDocument();
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();
  });
});