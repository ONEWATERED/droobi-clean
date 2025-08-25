import { listTrainings, getTraining, enroll, setProgress, getProgress } from '../trainings';

describe('Trainings API', () => {
  describe('listTrainings', () => {
    it('should return all trainings without filters', async () => {
      const trainings = await listTrainings();
      expect(trainings.length).toBeGreaterThan(0);
      expect(trainings[0]).toHaveProperty('id');
      expect(trainings[0]).toHaveProperty('title');
      expect(trainings[0]).toHaveProperty('lessons');
    });

    it('should filter trainings by search query', async () => {
      const trainings = await listTrainings({ q: 'AI' });
      expect(trainings.length).toBeGreaterThan(0);
      expect(trainings[0].title).toContain('AI');
    });

    it('should filter trainings by level', async () => {
      const trainings = await listTrainings({ level: 'beginner' });
      expect(trainings.length).toBeGreaterThan(0);
      expect(trainings[0].level).toBe('beginner');
    });

    it('should filter trainings by tag', async () => {
      const trainings = await listTrainings({ tag: 'ai' });
      expect(trainings.length).toBeGreaterThan(0);
      expect(trainings[0].tags).toContain('ai');
    });

    it('should return empty array for non-matching search', async () => {
      const trainings = await listTrainings({ q: 'nonexistent' });
      expect(trainings).toHaveLength(0);
    });

    it('should sort trainings by publishedAt desc', async () => {
      const trainings = await listTrainings();
      if (trainings.length > 1) {
        const firstDate = new Date(trainings[0].publishedAt);
        const secondDate = new Date(trainings[1].publishedAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe('getTraining', () => {
    it('should return training for existing id', async () => {
      const training = await getTraining('t1');
      expect(training).toBeTruthy();
      expect(training?.id).toBe('t1');
      expect(training?.title).toBe('AI for One Water – Basics');
    });

    it('should return null for non-existent id', async () => {
      const training = await getTraining('unknown');
      expect(training).toBeNull();
    });
  });

  describe('enroll', () => {
    it('should enroll user for existing training', async () => {
      const enrollment = await enroll({
        userId: 'test-user',
        trainingId: 't1',
        name: 'Test User',
        email: 'test@example.com'
      });
      
      expect(enrollment).toBeTruthy();
      expect(enrollment?.trainingId).toBe('t1');
      expect(enrollment?.name).toBe('Test User');
      expect(enrollment?.email).toBe('test@example.com');
    });

    it('should return null for non-existent training', async () => {
      const enrollment = await enroll({
        userId: 'test-user',
        trainingId: 'unknown',
        name: 'Test User',
        email: 'test@example.com'
      });
      
      expect(enrollment).toBeNull();
    });

    it('should return existing enrollment if already enrolled', async () => {
      // Enroll once
      const firstEnrollment = await enroll({
        userId: 'test-user-2',
        trainingId: 't2',
        name: 'Test User 2',
        email: 'test2@example.com'
      });
      
      // Try to enroll again
      const secondEnrollment = await enroll({
        userId: 'test-user-2',
        trainingId: 't2',
        name: 'Test User 2 Updated',
        email: 'test2@example.com'
      });
      
      expect(firstEnrollment?.id).toBe(secondEnrollment?.id);
    });
  });

  describe('setProgress and getProgress', () => {
    it('should set and retrieve progress', async () => {
      const progressEntry = await setProgress({
        userId: 'test-user',
        trainingId: 't1',
        lessonId: 'l1',
        status: 'complete'
      });
      
      expect(progressEntry).toBeTruthy();
      expect(progressEntry.status).toBe('complete');
      expect(progressEntry.lessonId).toBe('l1');
      
      const progress = await getProgress({
        userId: 'test-user',
        trainingId: 't1'
      });
      
      expect(progress.length).toBeGreaterThan(0);
      expect(progress.some(p => p.lessonId === 'l1' && p.status === 'complete')).toBe(true);
    });

    it('should update existing progress', async () => {
      // Set initial progress
      await setProgress({
        userId: 'test-user-3',
        trainingId: 't1',
        lessonId: 'l2',
        status: 'complete'
      });
      
      // Update progress
      const updatedProgress = await setProgress({
        userId: 'test-user-3',
        trainingId: 't1',
        lessonId: 'l2',
        status: 'incomplete'
      });
      
      expect(updatedProgress.status).toBe('incomplete');
      
      const progress = await getProgress({
        userId: 'test-user-3',
        trainingId: 't1'
      });
      
      expect(progress.some(p => p.lessonId === 'l2' && p.status === 'incomplete')).toBe(true);
    });
  });
});