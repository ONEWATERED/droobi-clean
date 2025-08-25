import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizPage from '../quiz/page';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Quiz Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'q1',
          date: '2025-09-01',
          question: 'What does SCADA stand for?',
          options: ['Supervisory Control and Data Acquisition','System Control and Data Access','Secure Control and DAQ Analytics'],
          answerIndex: 0,
          explanation: 'SCADA = Supervisory Control and Data Acquisition.'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: 'q2', date: '2025-09-02', question: 'Which process removes dissolved ions from water?' },
          { id: 'q1', date: '2025-09-01', question: 'What does SCADA stand for?' }
        ])
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render quiz page with title', async () => {
    render(<QuizPage />);
    
    expect(screen.getByText('Daily Quiz')).toBeInTheDocument();
    expect(screen.getByText('Test your knowledge with our daily water technology questions')).toBeInTheDocument();
  });

  it('should load and display today\'s quiz', async () => {
    render(<QuizPage />);
    
    await waitFor(() => {
      expect(screen.getByText('What does SCADA stand for?')).toBeInTheDocument();
      expect(screen.getByText('Supervisory Control and Data Acquisition')).toBeInTheDocument();
      expect(screen.getByText('System Control and Data Access')).toBeInTheDocument();
      expect(screen.getByText('Secure Control and DAQ Analytics')).toBeInTheDocument();
    });
  });

  it('should show submit button when option is selected', async () => {
    render(<QuizPage />);
    
    await waitFor(() => {
      expect(screen.getByText('What does SCADA stand for?')).toBeInTheDocument();
    });

    // Initially submit button should be disabled
    const submitButton = screen.getByText('Submit Answer');
    expect(submitButton).toBeDisabled();

    // Select an option
    const firstOption = screen.getByLabelText('Supervisory Control and Data Acquisition');
    fireEvent.click(firstOption);

    // Submit button should now be enabled
    expect(submitButton).not.toBeDisabled();
  });

  it('should submit answer and show result', async () => {
    // Mock the submit response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'q1',
          date: '2025-09-01',
          question: 'What does SCADA stand for?',
          options: ['Supervisory Control and Data Acquisition','System Control and Data Access','Secure Control and DAQ Analytics'],
          answerIndex: 0,
          explanation: 'SCADA = Supervisory Control and Data Acquisition.'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          correct: true,
          response: {
            quizId: 'q1',
            userId: 'u1',
            choiceIndex: 0,
            correct: true,
            at: Date.now()
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          counts: [5, 2, 1],
          total: 8,
          correctRate: 0.625
        })
      });

    render(<QuizPage />);
    
    // Wait for quiz to load
    await waitFor(() => {
      expect(screen.getByText('What does SCADA stand for?')).toBeInTheDocument();
    });

    // Select correct answer
    const correctOption = screen.getByLabelText('Supervisory Control and Data Acquisition');
    fireEvent.click(correctOption);

    // Submit
    const submitButton = screen.getByText('Submit Answer');
    fireEvent.click(submitButton);

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      expect(screen.getByText('SCADA = Supervisory Control and Data Acquisition.')).toBeInTheDocument();
    });
  });

  it('should display quiz history', async () => {
    render(<QuizPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Quizzes')).toBeInTheDocument();
    });
  });

  it('should show quiz info in sidebar', async () => {
    render(<QuizPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Today\'s Quiz')).toBeInTheDocument();
      expect(screen.getByText('2025-09-01')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });
});