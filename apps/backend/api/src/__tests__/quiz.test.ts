import { getTodayQuiz, getQuizById, submitResponse, getMyResponse, getStats, getHistory } from '../quiz';

describe('Quiz API', () => {
  describe('getTodayQuiz', () => {
    it('should return quiz for exact date match', async () => {
      const quiz = await getTodayQuiz('2025-09-01');
      expect(quiz).toBeTruthy();
      expect(quiz?.id).toBe('q1');
      expect(quiz?.date).toBe('2025-09-01');
    });

    it('should return most recent past quiz when no exact match', async () => {
      const quiz = await getTodayQuiz('2025-09-10');
      expect(quiz).toBeTruthy();
      expect(quiz?.id).toBe('q2'); // Most recent
      expect(quiz?.date).toBe('2025-09-02');
    });

    it('should return null when no quiz available', async () => {
      const quiz = await getTodayQuiz('2025-08-01');
      expect(quiz).toBeNull();
    });
  });

  describe('getQuizById', () => {
    it('should return quiz for existing id', async () => {
      const quiz = await getQuizById('q1');
      expect(quiz).toBeTruthy();
      expect(quiz?.question).toBe('What does SCADA stand for?');
      expect(quiz?.options).toHaveLength(3);
      expect(quiz?.answerIndex).toBe(0);
    });

    it('should return null for non-existent id', async () => {
      const quiz = await getQuizById('unknown');
      expect(quiz).toBeNull();
    });
  });

  describe('submitResponse', () => {
    it('should submit correct answer', async () => {
      const result = await submitResponse({
        userId: 'test-user-1',
        quizId: 'q1',
        choiceIndex: 0
      });
      
      expect(result).toBeTruthy();
      expect(result?.isCorrect).toBe(true);
      expect(result?.response.correct).toBe(true);
      expect(result?.response.choiceIndex).toBe(0);
    });

    it('should submit incorrect answer', async () => {
      const result = await submitResponse({
        userId: 'test-user-2',
        quizId: 'q1',
        choiceIndex: 1
      });
      
      expect(result).toBeTruthy();
      expect(result?.isCorrect).toBe(false);
      expect(result?.response.correct).toBe(false);
      expect(result?.response.choiceIndex).toBe(1);
    });

    it('should return null for non-existent quiz', async () => {
      const result = await submitResponse({
        userId: 'test-user-3',
        quizId: 'unknown',
        choiceIndex: 0
      });
      
      expect(result).toBeNull();
    });

    it('should throw error for duplicate submission', async () => {
      // Submit once
      await submitResponse({
        userId: 'test-user-4',
        quizId: 'q2',
        choiceIndex: 1
      });
      
      // Try to submit again
      await expect(submitResponse({
        userId: 'test-user-4',
        quizId: 'q2',
        choiceIndex: 0
      })).rejects.toThrow('You have already answered this quiz');
    });

    it('should throw error for invalid choice index', async () => {
      await expect(submitResponse({
        userId: 'test-user-5',
        quizId: 'q1',
        choiceIndex: 5
      })).rejects.toThrow('Invalid choice index');
    });
  });

  describe('getMyResponse', () => {
    it('should return response for user who answered', async () => {
      // Submit a response first
      await submitResponse({
        userId: 'test-user-6',
        quizId: 'q1',
        choiceIndex: 0
      });
      
      const response = await getMyResponse('test-user-6', 'q1');
      expect(response).toBeTruthy();
      expect(response?.choiceIndex).toBe(0);
      expect(response?.correct).toBe(true);
    });

    it('should return null for user who has not answered', async () => {
      const response = await getMyResponse('never-answered', 'q1');
      expect(response).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return stats for quiz with responses', async () => {
      // Submit some responses first
      await submitResponse({ userId: 'stats-user-1', quizId: 'q2', choiceIndex: 1 }); // Correct
      await submitResponse({ userId: 'stats-user-2', quizId: 'q2', choiceIndex: 0 }); // Incorrect
      await submitResponse({ userId: 'stats-user-3', quizId: 'q2', choiceIndex: 1 }); // Correct
      
      const stats = await getStats('q2');
      expect(stats.total).toBe(3);
      expect(stats.counts[0]).toBe(1); // One wrong answer
      expect(stats.counts[1]).toBe(2); // Two correct answers
      expect(stats.correctRate).toBeCloseTo(2/3, 2);
    });

    it('should return empty stats for quiz with no responses', async () => {
      const stats = await getStats('q1');
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.counts).toHaveLength(3);
      expect(stats.correctRate).toBeGreaterThanOrEqual(0);
    });

    it('should return empty stats for non-existent quiz', async () => {
      const stats = await getStats('unknown');
      expect(stats.counts).toEqual([]);
      expect(stats.total).toBe(0);
      expect(stats.correctRate).toBe(0);
    });
  });

  describe('getHistory', () => {
    it('should return quiz history sorted by date desc', async () => {
      const history = await getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('date');
      expect(history[0]).toHaveProperty('question');
      
      // Should be sorted by date desc
      if (history.length > 1) {
        expect(history[0].date >= history[1].date).toBe(true);
      }
    });

    it('should respect limit parameter', async () => {
      const history = await getHistory(1);
      expect(history.length).toBeLessThanOrEqual(1);
    });

    it('should not include sensitive data', async () => {
      const history = await getHistory();
      history.forEach(item => {
        expect(item).not.toHaveProperty('answerIndex');
        expect(item).not.toHaveProperty('explanation');
        expect(item).not.toHaveProperty('options');
      });
    });
  });
});