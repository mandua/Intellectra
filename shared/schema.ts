import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  major: text("major"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: integer("priority").notNull().default(2), // 1 = high, 2 = medium, 3 = low
  completed: boolean("completed").notNull().default(false),
  category: text("category"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

// Study Sessions
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  subject: text("subject"),
  description: text("description"),
  location: text("location"),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
});

// Notes
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Flashcard Sets
export const flashcardSets = pgTable("flashcard_sets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFlashcardSetSchema = createInsertSchema(flashcardSets).omit({
  id: true,
  createdAt: true,
});

// Flashcards
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  setId: integer("set_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  lastReviewed: timestamp("last_reviewed"),
  proficiency: integer("proficiency").default(0), // 0-4 scale for spaced repetition
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
});

// Study Progress
export const studyProgress = pgTable("study_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  studyDuration: integer("study_duration").notNull(), // in minutes
  subject: text("subject"),
  notes: text("notes"),
});

export const insertStudyProgressSchema = createInsertSchema(studyProgress).omit({
  id: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type FlashcardSet = typeof flashcardSets.$inferSelect;
export type InsertFlashcardSet = z.infer<typeof insertFlashcardSetSchema>;

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;

export type StudyProgress = typeof studyProgress.$inferSelect;
export type InsertStudyProgress = z.infer<typeof insertStudyProgressSchema>;
