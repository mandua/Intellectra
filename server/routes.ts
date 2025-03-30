import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertStudySessionSchema, 
  insertNotesSchema, 
  insertFlashcardDeckSchema, 
  insertFlashcardSchema, 
  insertExamSchema,
  DEMO_USER_ID
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import openai from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup API prefix
  const api = (path: string) => `/api${path}`;
  
  // Helper for handling zod validation errors
  const validateRequestBody = <T extends z.ZodType>(schema: T, body: any): z.infer<T> => {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw new Error(validationError.message);
      }
      throw error;
    }
  };

  // Error handler middleware
  const handleError = (err: any, res: Response) => {
    console.error('API error:', err);
    const status = err.status || 400;
    const message = err.message || 'Something went wrong';
    res.status(status).json({ error: message });
  };
  
  // User endpoints (for a real app, would add authentication)
  app.get(api('/user'), async (req: Request, res: Response) => {
    try {
      // For demo purpose, always return the demo user
      const user = await storage.getUser(DEMO_USER_ID);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Task endpoints
  app.get(api('/tasks'), async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks(DEMO_USER_ID);
      res.json(tasks);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get(api('/tasks/date/:date'), async (req: Request, res: Response) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      const tasks = await storage.getTasksByDate(DEMO_USER_ID, date);
      res.json(tasks);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get(api('/tasks/:id'), async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/tasks'), async (req: Request, res: Response) => {
    try {
      const taskData = validateRequestBody(insertTaskSchema, req.body);
      
      // Set the userId to the demo user
      taskData.userId = DEMO_USER_ID;
      
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch(api('/tasks/:id'), async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = validateRequestBody(insertTaskSchema.partial(), req.body);
      
      const updatedTask = await storage.updateTask(taskId, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(updatedTask);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.delete(api('/tasks/:id'), async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const result = await storage.deleteTask(taskId);
      
      if (!result) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Study session endpoints
  app.get(api('/study-sessions'), async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getStudySessions(DEMO_USER_ID);
      res.json(sessions);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get(api('/study-sessions/range'), async (req: Request, res: Response) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      const sessions = await storage.getStudySessionsByDateRange(DEMO_USER_ID, startDate, endDate);
      res.json(sessions);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/study-sessions'), async (req: Request, res: Response) => {
    try {
      const sessionData = validateRequestBody(insertStudySessionSchema, req.body);
      
      // Set the userId to the demo user
      sessionData.userId = DEMO_USER_ID;
      
      const newSession = await storage.createStudySession(sessionData);
      res.status(201).json(newSession);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch(api('/study-sessions/:id/end'), async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const endTime = req.body.endTime ? new Date(req.body.endTime) : new Date();
      
      if (isNaN(endTime.getTime())) {
        return res.status(400).json({ error: 'Invalid end time' });
      }
      
      const updatedSession = await storage.endStudySession(sessionId, endTime);
      
      if (!updatedSession) {
        return res.status(404).json({ error: 'Study session not found' });
      }
      
      res.json(updatedSession);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Notes endpoints
  app.get(api('/notes'), async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes(DEMO_USER_ID);
      res.json(notes);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get(api('/notes/:id'), async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getNote(noteId);
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json(note);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/notes'), async (req: Request, res: Response) => {
    try {
      const noteData = validateRequestBody(insertNotesSchema, req.body);
      
      // Set the userId to the demo user
      noteData.userId = DEMO_USER_ID;
      
      const newNote = await storage.createNote(noteData);
      res.status(201).json(newNote);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch(api('/notes/:id'), async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      const noteData = validateRequestBody(insertNotesSchema.partial(), req.body);
      
      const updatedNote = await storage.updateNote(noteId, noteData);
      
      if (!updatedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json(updatedNote);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.delete(api('/notes/:id'), async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      const result = await storage.deleteNote(noteId);
      
      if (!result) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Flashcard deck endpoints
  app.get(api('/flashcard-decks'), async (req: Request, res: Response) => {
    try {
      const decks = await storage.getFlashcardDecks(DEMO_USER_ID);
      res.json(decks);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get(api('/flashcard-decks/:id'), async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.id);
      const deck = await storage.getFlashcardDeck(deckId);
      
      if (!deck) {
        return res.status(404).json({ error: 'Flashcard deck not found' });
      }
      
      res.json(deck);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/flashcard-decks'), async (req: Request, res: Response) => {
    try {
      const deckData = validateRequestBody(insertFlashcardDeckSchema, req.body);
      
      // Set the userId to the demo user
      deckData.userId = DEMO_USER_ID;
      
      const newDeck = await storage.createFlashcardDeck(deckData);
      res.status(201).json(newDeck);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch(api('/flashcard-decks/:id'), async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.id);
      const deckData = validateRequestBody(insertFlashcardDeckSchema.partial(), req.body);
      
      const updatedDeck = await storage.updateFlashcardDeck(deckId, deckData);
      
      if (!updatedDeck) {
        return res.status(404).json({ error: 'Flashcard deck not found' });
      }
      
      res.json(updatedDeck);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.delete(api('/flashcard-decks/:id'), async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.id);
      const result = await storage.deleteFlashcardDeck(deckId);
      
      if (!result) {
        return res.status(404).json({ error: 'Flashcard deck not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Flashcard endpoints
  app.get(api('/flashcard-decks/:deckId/flashcards'), async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.deckId);
      const flashcards = await storage.getFlashcards(deckId);
      res.json(flashcards);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/flashcard-decks/:deckId/flashcards'), async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.deckId);
      
      // Make sure the deck exists
      const deck = await storage.getFlashcardDeck(deckId);
      if (!deck) {
        return res.status(404).json({ error: 'Flashcard deck not found' });
      }
      
      const flashcardData = validateRequestBody(insertFlashcardSchema, req.body);
      
      // Set the deckId
      flashcardData.deckId = deckId;
      
      const newFlashcard = await storage.createFlashcard(flashcardData);
      res.status(201).json(newFlashcard);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch(api('/flashcards/:id'), async (req: Request, res: Response) => {
    try {
      const flashcardId = parseInt(req.params.id);
      const flashcardData = validateRequestBody(insertFlashcardSchema.partial(), req.body);
      
      const updatedFlashcard = await storage.updateFlashcard(flashcardId, flashcardData);
      
      if (!updatedFlashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      
      res.json(updatedFlashcard);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch(api('/flashcards/:id/mastery'), async (req: Request, res: Response) => {
    try {
      const flashcardId = parseInt(req.params.id);
      const { masteryLevel } = req.body;
      
      if (typeof masteryLevel !== 'number' || masteryLevel < 0 || masteryLevel > 100) {
        return res.status(400).json({ error: 'Invalid mastery level (should be between 0-100)' });
      }
      
      const updatedFlashcard = await storage.updateFlashcardMastery(flashcardId, masteryLevel);
      
      if (!updatedFlashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      
      res.json(updatedFlashcard);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.delete(api('/flashcards/:id'), async (req: Request, res: Response) => {
    try {
      const flashcardId = parseInt(req.params.id);
      const result = await storage.deleteFlashcard(flashcardId);
      
      if (!result) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Exam endpoints
  app.get(api('/exams'), async (req: Request, res: Response) => {
    try {
      const exams = await storage.getExams(DEMO_USER_ID);
      res.json(exams);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get(api('/exams/upcoming'), async (req: Request, res: Response) => {
    try {
      const exams = await storage.getUpcomingExams(DEMO_USER_ID);
      res.json(exams);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/exams'), async (req: Request, res: Response) => {
    try {
      const examData = validateRequestBody(insertExamSchema, req.body);
      
      // Set the userId to the demo user
      examData.userId = DEMO_USER_ID;
      
      const newExam = await storage.createExam(examData);
      res.status(201).json(newExam);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // AI-powered endpoints
  app.post(api('/ai/recommendations'), async (req: Request, res: Response) => {
    try {
      const { productivityData, subjects } = req.body;
      
      if (!productivityData || !subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }
      
      const recommendations = await openai.generateStudyRecommendations(
        DEMO_USER_ID,
        productivityData,
        subjects
      );
      
      res.json({ recommendations });
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/ai/flashcards/generate'), async (req: Request, res: Response) => {
    try {
      const { noteContent, subject, count } = req.body;
      
      if (!noteContent || !subject) {
        return res.status(400).json({ error: 'Note content and subject are required' });
      }
      
      const flashcards = await openai.generateFlashcardsFromNotes(
        noteContent,
        subject,
        count || 5
      );
      
      res.json({ flashcards });
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/ai/notes/enhance'), async (req: Request, res: Response) => {
    try {
      const { noteContent } = req.body;
      
      if (!noteContent) {
        return res.status(400).json({ error: 'Note content is required' });
      }
      
      const enhanced = await openai.enhanceNotes(noteContent);
      res.json(enhanced);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post(api('/ai/quiz/generate'), async (req: Request, res: Response) => {
    try {
      const { deckId, count } = req.body;
      
      if (!deckId) {
        return res.status(400).json({ error: 'Deck ID is required' });
      }
      
      const flashcards = await storage.getFlashcards(deckId);
      
      if (flashcards.length === 0) {
        return res.status(400).json({ error: 'Deck has no flashcards' });
      }
      
      const quiz = await openai.generateQuizQuestions(deckId, flashcards, count || 5);
      res.json({ quiz });
    } catch (err) {
      handleError(err, res);
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
