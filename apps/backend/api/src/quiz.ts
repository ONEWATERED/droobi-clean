import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const QUESTIONS_PATH = resolve(__dirname, '../../../../data/seeds/quiz/questions.json');
const RESPONSES_PATH = resolve(__dirname, '../../../../data/seeds/quiz/responses.json');

export interface Question {
  id: string;
  date: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Response {
  quizId: string;
  userId: string;
  choiceIndex: number;
  correct: boolean;
  at: number;
}

export interface Stats {
  counts: number[];
  total: number;
  correctRate: number;
}

let questionsCache: Question[] | null = null;
let responsesCache: Response[] | null = null;

async function loadQuestions(): Promise<Question[]> {
  if (questionsCache) return questionsCache;
  const raw = await readFile(QUESTIONS_PATH, 'utf-8');
  questionsCache = JSON.parse(raw);
  return questionsCache!;
}

async function loadResponses(): Promise<Response[]> {
  if (responsesCache) return responsesCache;
  
  if (!existsSync(RESPONSES_PATH)) {
    responsesCache = [];
    return responsesCache;
  }
  
  const raw = await readFile(RESPONSES_PATH, 'utf-8');
  responsesCache = JSON.parse(raw);
  return responsesCache!;
}

async function saveResponses(responses: Response[]): Promise<void> {
  responsesCache = responses;
  await writeFile(RESPONSES_PATH, JSON.stringify(responses, null, 2), 'utf-8');
}

export async function getTodayQuiz(today?: string): Promise<Question | null> {
  const questions = await loadQuestions();
  
  // Use provided date or current UTC date
  const targetDate = today || new Date().toISOString().split('T')[0];
  
  // First try to find exact match for today
  let todayQuestion = questions.find(q => q.date === targetDate);
  
  // If no exact match, find the most recent past question
  if (!todayQuestion) {
    const pastQuestions = questions
      .filter(q => q.date <= targetDate)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    todayQuestion = pastQuestions[0] || null;
  }
  
  return todayQuestion;
}

export async function getQuizById(id: string): Promise<Question | null> {
  const questions = await loadQuestions();
  return questions.find(q => q.id === id) || null;
}

export async function submitResponse(data: {
  userId: string;
  quizId: string;
  choiceIndex: number;
}): Promise<{ response: Response; isCorrect: boolean } | null> {
  // Check if quiz exists
  const quiz = await getQuizById(data.quizId);
  if (!quiz) return null;

  const responses = await loadResponses();
  
  // Check if user already responded to this quiz
  const existingResponse = responses.find(
    r => r.userId === data.userId && r.quizId === data.quizId
  );
  
  if (existingResponse) {
    throw new Error('You have already answered this quiz');
  }

  // Validate choice index
  if (data.choiceIndex < 0 || data.choiceIndex >= quiz.options.length) {
    throw new Error('Invalid choice index');
  }

  // Create response
  const isCorrect = data.choiceIndex === quiz.answerIndex;
  const response: Response = {
    quizId: data.quizId,
    userId: data.userId,
    choiceIndex: data.choiceIndex,
    correct: isCorrect,
    at: Date.now()
  };

  responses.push(response);
  await saveResponses(responses);

  return { response, isCorrect };
}

export async function getMyResponse(userId: string, quizId: string): Promise<Response | null> {
  const responses = await loadResponses();
  return responses.find(r => r.userId === userId && r.quizId === quizId) || null;
}

export async function getStats(quizId: string): Promise<Stats> {
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    return { counts: [], total: 0, correctRate: 0 };
  }

  const responses = await loadResponses();
  const quizResponses = responses.filter(r => r.quizId === quizId);
  
  // Count responses per option
  const counts = new Array(quiz.options.length).fill(0);
  let correctCount = 0;
  
  quizResponses.forEach(response => {
    if (response.choiceIndex >= 0 && response.choiceIndex < counts.length) {
      counts[response.choiceIndex]++;
    }
    if (response.correct) {
      correctCount++;
    }
  });

  const total = quizResponses.length;
  const correctRate = total > 0 ? correctCount / total : 0;

  return { counts, total, correctRate };
}

export async function getHistory(limit: number = 14): Promise<Array<{
  id: string;
  date: string;
  question: string;
}>> {
  const questions = await loadQuestions();
  
  // Sort by date desc (newest first) and limit
  return questions
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(q => ({
      id: q.id,
      date: q.date,
      question: q.question
    }));
}