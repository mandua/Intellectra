import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  startTime: text("start_time"),
  duration: integer("duration"), // duration in minutes
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"), // low, medium, high
  subject: text("subject"),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  subject: text("subject"),
  notes: text("notes"),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  keyPoints: json("key_points").$type<string[]>().default([]),
});

export const flashcardDecks = pgTable("flashcard_decks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
  lastStudied: timestamp("last_studied"),
  cardsCount: integer("cards_count").default(0),
  masteryLevel: integer("mastery_level").default(0),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  masteryLevel: integer("mastery_level").default(0), // 0-100%
  lastReviewed: timestamp("last_reviewed"),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  subject: text("subject"),
  date: timestamp("date").notNull(),
  description: text("description"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
});

export const insertNotesSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFlashcardDeckSchema = createInsertSchema(flashcardDecks).omit({
  id: true,
  createdAt: true,
  lastStudied: true,
  cardsCount: true,
  masteryLevel: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
  masteryLevel: true,
  lastReviewed: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

export type InsertNote = z.infer<typeof insertNotesSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertFlashcardDeck = z.infer<typeof insertFlashcardDeckSchema>;
export type FlashcardDeck = typeof flashcardDecks.$inferSelect;

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

// Create a mock user for demo purposes
export const DEMO_USER_ID = 1;
