import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileEditorPage from '../me/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Profile Editor Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'u1',
        orgId: 'demo',
        name: 'Demo User',
        title: 'Project Manager',
        bio: 'Leads cross-functional teams delivering water & AI projects.',
        skills: ['Permitting', 'SCADA', 'AI Agents'],
        avatarUrl: '',
        socials: { linkedin: 'https://linkedin.com/in/demo', x: 'https://x.com/demo' }
      })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile editor with title', async () => {
    render(<ProfileEditorPage />);
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage your professional profile information')).toBeInTheDocument();
  });

  it('should load and display profile data', async () => {
    render(<ProfileEditorPage />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Demo User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Project Manager')).toBeInTheDocument();
    });
  });

  it('should update title and save', async () => {
    // Mock the PATCH request
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'u1',
          orgId: 'demo',
          name: 'Demo User',
          title: 'Project Manager',
          bio: 'Leads cross-functional teams delivering water & AI projects.',
          skills: ['Permitting', 'SCADA', 'AI Agents'],
          avatarUrl: '',
          socials: { linkedin: 'https://linkedin.com/in/demo', x: 'https://x.com/demo' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'u1',
          orgId: 'demo',
          name: 'Demo User',
          title: 'Senior Project Manager',
          bio: 'Leads cross-functional teams delivering water & AI projects.',
          skills: ['Permitting', 'SCADA', 'AI Agents'],
          avatarUrl: '',
          socials: { linkedin: 'https://linkedin.com/in/demo', x: 'https://x.com/demo' }
        })
      });

    render(<ProfileEditorPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Project Manager')).toBeInTheDocument();
    });

    // Change the title
    const titleInput = screen.getByDisplayValue('Project Manager');
    fireEvent.change(titleInput, { target: { value: 'Senior Project Manager' } });

    // Click save
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
    });

    // Verify PATCH was called
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/profiles/me',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Senior Project Manager')
      })
    );
  });
});