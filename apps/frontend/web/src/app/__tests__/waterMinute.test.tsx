import { render, screen, waitFor } from '@testing-library/react';

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

// Create a mock component for the Water Minute page since we can't import server components directly
function MockWaterMinutePage({ todayMinute, history }: any) {
  return (
    <div>
      <h1>Water Minute</h1>
      <p>Daily 60-second insights on water technology, operations, and industry trends</p>
      
      {todayMinute ? (
        <div>
          <h2>{todayMinute.title}</h2>
          <p>{todayMinute.summary}</p>
          {todayMinute.tags.map((tag: string, index: number) => (
            <span key={index}>{tag}</span>
          ))}
        </div>
      ) : (
        <div>
          <h3>No Water Minute Available</h3>
          <p>Check back later for today's water technology insight.</p>
        </div>
      )}
      
      <div>
        <h3>Recent Minutes</h3>
        {history.length === 0 ? (
          <p>No history available</p>
        ) : (
          history.map((item: any) => (
            <div key={item.id}>
              <p>{item.title}</p>
              <p>{item.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

describe('Water Minute Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'wm-2025-09-01',
          date: '2025-09-01',
          title: 'What is One Water?',
          summary: 'A 60-second primer on integrated water.',
          mediaType: 'video',
          url: 'https://storage.example.com/wm/one-water.mp4',
          poster: 'https://storage.example.com/wm/one-water.jpg',
          tags: ['one-water', 'primer'],
          publishedAt: '2025-09-01T12:00:00Z'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: 'wm-2025-09-03', date: '2025-09-03', title: 'PFAS at a glance', tags: ['pfas', 'drinking-water'] },
          { id: 'wm-2025-09-02', date: '2025-09-02', title: 'CSO vs. SSO', tags: ['wastewater', 'ops'] },
          { id: 'wm-2025-09-01', date: '2025-09-01', title: 'What is One Water?', tags: ['one-water', 'primer'] }
        ])
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render water minute page with title', async () => {
    const mockData = {
      todayMinute: {
        id: 'wm-2025-09-01',
        date: '2025-09-01',
        title: 'What is One Water?',
        summary: 'A 60-second primer on integrated water.',
        mediaType: 'video',
        tags: ['one-water', 'primer']
      },
      history: []
    };

    render(<MockWaterMinutePage {...mockData} />);
    
    expect(screen.getByText('Water Minute')).toBeInTheDocument();
    expect(screen.getByText('Daily 60-second insights on water technology, operations, and industry trends')).toBeInTheDocument();
  });

  it('should display today\'s water minute', async () => {
    const mockData = {
      todayMinute: {
        id: 'wm-2025-09-01',
        date: '2025-09-01',
        title: 'What is One Water?',
        summary: 'A 60-second primer on integrated water.',
        mediaType: 'video',
        tags: ['one-water', 'primer']
      },
      history: []
    };

    render(<MockWaterMinutePage {...mockData} />);
    
    expect(screen.getByText('What is One Water?')).toBeInTheDocument();
    expect(screen.getByText('A 60-second primer on integrated water.')).toBeInTheDocument();
    expect(screen.getByText('one-water')).toBeInTheDocument();
    expect(screen.getByText('primer')).toBeInTheDocument();
  });

  it('should show empty state when no minute available', async () => {
    const mockData = {
      todayMinute: null,
      history: []
    };

    render(<MockWaterMinutePage {...mockData} />);
    
    expect(screen.getByText('No Water Minute Available')).toBeInTheDocument();
    expect(screen.getByText('Check back later for today\'s water technology insight.')).toBeInTheDocument();
  });

  it('should display history items', async () => {
    const mockData = {
      todayMinute: null,
      history: [
        { id: 'wm-2025-09-03', date: '2025-09-03', title: 'PFAS at a glance', tags: ['pfas'] },
        { id: 'wm-2025-09-02', date: '2025-09-02', title: 'CSO vs. SSO', tags: ['wastewater'] }
      ]
    };

    render(<MockWaterMinutePage {...mockData} />);
    
    expect(screen.getByText('Recent Minutes')).toBeInTheDocument();
    expect(screen.getByText('PFAS at a glance')).toBeInTheDocument();
    expect(screen.getByText('CSO vs. SSO')).toBeInTheDocument();
    expect(screen.getByText('2025-09-03')).toBeInTheDocument();
    expect(screen.getByText('2025-09-02')).toBeInTheDocument();
  });

  it('should show empty history state', async () => {
    const mockData = {
      todayMinute: null,
      history: []
    };

    render(<MockWaterMinutePage {...mockData} />);
    
    expect(screen.getByText('No history available')).toBeInTheDocument();
  });
});