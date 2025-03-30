// User
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  major?: string;
  avatarUrl?: string;
}

// Task
export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: number; // 1 = high, 2 = medium, 3 = low
  completed: boolean;
  category?: string;
}

// Study Session
export interface StudySession {
  id: number;
  userId: number;
  title: string;
  startTime: string;
  endTime?: string;
  subject?: string;
  description?: string;
  location?: string;
}

// Note
export interface Note {
  id: number;
  userId: number;
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Flashcard Set
export interface FlashcardSet {
  id: number;
  userId: number;
  title: string;
  description?: string;
  subject?: string;
  tags?: string[];
  createdAt: string;
}

// Flashcard
export interface Flashcard {
  id: number;
  setId: number;
  question: string;
  answer: string;
  lastReviewed?: string;
  proficiency?: number; // 0-4 scale for spaced repetition
}

// Study Progress
export interface StudyProgress {
  id: number;
  userId: number;
  date: string;
  studyDuration: number; // in minutes
  subject?: string;
  notes?: string;
}

// AI Recommendation
export interface Recommendation {
  title: string;
  description: string;
  type: "AI Suggested" | "Pomodoro" | "Resource" | "Quiz" | "Review";
  icon: string;
}
