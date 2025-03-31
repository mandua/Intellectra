import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStudyRecommendations, generateFlashcardsFromNotes, enhanceNotes, generateConceptMap } from "./gemini";
import { z } from "zod";
import { insertTaskSchema, insertStudySessionSchema, insertNoteSchema, insertFlashcardSetSchema, insertFlashcardSchema, insertStudyProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Helper function to validate request body with Zod schema
  function validateBody<T>(schema: z.ZodType<T>) {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        res.status(400).json({ message: "Invalid request body", errors: error });
      }
    };
  }

  // Get current user (for demo purposes)
  app.get("/api/user", async (_req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // TASKS
  app.get("/api/tasks", async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tasks = await storage.getTasks(user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", validateBody(insertTaskSchema), async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const task = await storage.createTask({ ...req.body, userId: user.id });
    res.status(201).json(task);
  });

  app.put("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    const updatedTask = await storage.updateTask(id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(updatedTask);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    const success = await storage.deleteTask(id);
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).send();
  });

  // STUDY SESSIONS
  app.get("/api/study-sessions", async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const sessions = await storage.getStudySessions(user.id);
    res.json(sessions);
  });

  app.post("/api/study-sessions", validateBody(insertStudySessionSchema), async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const session = await storage.createStudySession({ ...req.body, userId: user.id });
    res.status(201).json(session);
  });

  app.put("/api/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }
    
    const updatedSession = await storage.updateStudySession(id, req.body);
    if (!updatedSession) {
      return res.status(404).json({ message: "Study session not found" });
    }
    
    res.json(updatedSession);
  });

  app.delete("/api/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }
    
    const success = await storage.deleteStudySession(id);
    if (!success) {
      return res.status(404).json({ message: "Study session not found" });
    }
    
    res.status(204).send();
  });

  // NOTES
  app.get("/api/notes", async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const notes = await storage.getNotes(user.id);
    res.json(notes);
  });

  app.post("/api/notes", validateBody(insertNoteSchema), async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const note = await storage.createNote({ ...req.body, userId: user.id });
    res.status(201).json(note);
  });

  app.put("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    
    const updatedNote = await storage.updateNote(id, req.body);
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    res.json(updatedNote);
  });

  app.delete("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    
    const success = await storage.deleteNote(id);
    if (!success) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    res.status(204).send();
  });

  // AI Enhanced Notes
  app.post("/api/notes/enhance", async (req, res) => {
    const { notes, subject } = req.body;
    if (!notes || !subject) {
      return res.status(400).json({ message: "Notes and subject are required" });
    }
    
    try {
      const enhanced = await enhanceNotes(notes, subject);
      res.json(enhanced);
    } catch (error) {
      console.error("Error enhancing notes:", error);
      res.status(500).json({ message: "Failed to enhance notes", error: (error as Error).message });
    }
  });

  // FLASHCARD SETS
  app.get("/api/flashcard-sets", async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const sets = await storage.getFlashcardSets(user.id);
    res.json(sets);
  });

  app.post("/api/flashcard-sets", validateBody(insertFlashcardSetSchema), async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const set = await storage.createFlashcardSet({ ...req.body, userId: user.id });
    res.status(201).json(set);
  });

  app.get("/api/flashcard-sets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid set ID" });
    }
    
    const set = await storage.getFlashcardSetById(id);
    if (!set) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }
    
    const flashcards = await storage.getFlashcards(id);
    res.json({ ...set, flashcards });
  });

  app.put("/api/flashcard-sets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid set ID" });
    }
    
    const updatedSet = await storage.updateFlashcardSet(id, req.body);
    if (!updatedSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }
    
    res.json(updatedSet);
  });

  app.delete("/api/flashcard-sets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid set ID" });
    }
    
    const success = await storage.deleteFlashcardSet(id);
    if (!success) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }
    
    res.status(204).send();
  });

  // FLASHCARDS
  app.get("/api/flashcard-sets/:setId/flashcards", async (req, res) => {
    const setId = parseInt(req.params.setId);
    if (isNaN(setId)) {
      return res.status(400).json({ message: "Invalid set ID" });
    }
    
    const flashcards = await storage.getFlashcards(setId);
    res.json(flashcards);
  });

  app.post("/api/flashcard-sets/:setId/flashcards", validateBody(insertFlashcardSchema), async (req, res) => {
    const setId = parseInt(req.params.setId);
    if (isNaN(setId)) {
      return res.status(400).json({ message: "Invalid set ID" });
    }
    
    // Check if set exists
    const set = await storage.getFlashcardSetById(setId);
    if (!set) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }
    
    const flashcard = await storage.createFlashcard({ ...req.body, setId });
    res.status(201).json(flashcard);
  });

  // AI Generated Flashcards
  app.post("/api/flashcards/generate", async (req, res) => {
    const { notes, subject, count } = req.body;
    if (!notes || !subject) {
      return res.status(400).json({ message: "Notes and subject are required" });
    }
    
    try {
      const flashcards = await generateFlashcardsFromNotes(notes, subject, count || 5);
      res.json(flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ message: "Failed to generate flashcards", error: (error as Error).message });
    }
  });

  // STUDY PROGRESS
  app.get("/api/study-progress", async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const progress = await storage.getStudyProgress(user.id);
    res.json(progress);
  });

  app.post("/api/study-progress", validateBody(insertStudyProgressSchema), async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const progress = await storage.createStudyProgress({ ...req.body, userId: user.id });
    res.status(201).json(progress);
  });

  // AI RECOMMENDATIONS
  app.get("/api/recommendations", async (req, res) => {
    const user = await storage.getUserByUsername("alexjohnson");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // For demo purposes, use fixed values
      const recentTopics = ["Algorithms", "Data Structures", "Database Design"];
      const upcomingExams = ["Database Midterm", "Algorithm Final"];
      const strugglingAreas = ["Graph Algorithms", "SQL Optimization"];
      
      const recommendations = await generateStudyRecommendations(
        recentTopics,
        upcomingExams,
        strugglingAreas
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations", error: (error as Error).message });
    }
  });
  
  // CONCEPT MAP
  app.get("/api/concept-map", async (req, res) => {
    const { topic, notes } = req.query;
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ message: "Topic is required as a query parameter" });
    }
    
    try {
      const conceptMap = await generateConceptMap(topic, typeof notes === 'string' ? notes : undefined);
      res.json(conceptMap);
    } catch (error) {
      console.error("Error generating concept map:", error);
      res.status(500).json({ message: "Failed to generate concept map", error: (error as Error).message });
    }
  });
  
  // CONCEPT MAP with POST (for larger text input)
  app.post("/api/concept-map", async (req, res) => {
    const { topic, notes } = req.body;
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ message: "Topic is required in the request body" });
    }
    
    try {
      const conceptMap = await generateConceptMap(topic, notes);
      res.json(conceptMap);
    } catch (error) {
      console.error("Error generating concept map:", error);
      res.status(500).json({ message: "Failed to generate concept map", error: (error as Error).message });
    }
  });

  return httpServer;
}
