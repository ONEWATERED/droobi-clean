import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InboxPage from '../inbox/page';

// Mock fetch
global.fetch = jest.fn();

describe('Inbox Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'n1',
          userId: 'u1',
          type: 'webinar.registered',
          title: "You're registered",
          body: 'AI for One Water – Kickoff',
          createdAt: 1735862400000,
          readAt: null
        },
        {
          id: 'n2',
          userId: 'u1',
          type: 'projects.saved',
          title: 'Project saved',
          body: 'Lift Station Upgrades – Phase 2',
          createdAt: 1735948800000,
          readAt: null
        },
        {
          id: 'n3',
          userId: 'u1',
          type: 'training.enrolled',
          title: 'Course enrollment confirmed',
          body: 'AI for One Water – Basics',
          createdAt: 1735776000000,
          readAt: 1735862400000
        }
      ])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render inbox page with title', async () => {
    render(<InboxPage />);
    
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Stay updated with your notifications and activity')).toBeInTheDocument();
  });

  it('should load and display notifications', async () => {
    render(<InboxPage />);
    
    await waitFor(() => {
      expect(screen.getByText("You're registered")).toBeInTheDocument();
      expect(screen.getByText('Project saved')).toBeInTheDocument();
      expect(screen.getByText('Course enrollment confirmed')).toBeInTheDocument();
    });
  });

  it('should show unread count and badges', async () => {
    render(<InboxPage />);
    
    await waitFor(() => {
      expect(screen.getByText('2 unread')).toBeInTheDocument();
      // Should show unread indicators (dots) for unread notifications
      const markReadButtons = screen.getAllByText('Mark Read');
      expect(markReadButtons).toHaveLength(2); // Only unread notifications have mark read buttons
    });
  });

  it('should mark notification as read when button clicked', async () => {
    // Mock the mark read API call
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'n1',
            userId: 'u1',
            type: 'webinar.registered',
            title: "You're registered",
            body: 'AI for One Water – Kickoff',
            createdAt: 1735862400000,
            readAt: null
          },
          {
            id: 'n2',
            userId: 'u1',
            type: 'projects.saved',
            title: 'Project saved',
            body: 'Lift Station Upgrades – Phase 2',
            createdAt: 1735948800000,
            readAt: null
          },
          {
            id: 'n3',
            userId: 'u1',
            type: 'training.enrolled',
            title: 'Course enrollment confirmed',
            body: 'AI for One Water – Basics',
            createdAt: 1735776000000,
            readAt: 1735862400000
          }
        ])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    render(<InboxPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("You're registered")).toBeInTheDocument();
    });

    // Click the first "Mark Read" button
    const markReadButtons = screen.getAllByText('Mark Read');
    fireEvent.click(markReadButtons[0]);

    // Verify the API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/inbox/n1/read',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'X-User-Id': 'u1'
          }
        })
      );
    });
  });

  it('should show empty state when no notifications', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<InboxPage />);
    
    await waitFor(() => {
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
      expect(screen.getByText('No notifications to show right now.')).toBeInTheDocument();
    });
  });

  it('should display notification types with appropriate badges', async () => {
    render(<InboxPage />);
    
    await waitFor(() => {
      expect(screen.getByText('webinar.registered')).toBeInTheDocument();
      expect(screen.getByText('projects.saved')).toBeInTheDocument();
      expect(screen.getByText('training.enrolled')).toBeInTheDocument();
    });
  });
});