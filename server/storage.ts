import { users, type User, type InsertUser, 
  tasks, type Task, type InsertTask,
  studySessions, type StudySession, type InsertStudySession,
  notes, type Note, type InsertNote,
  flashcardDecks, type FlashcardDeck, type InsertFlashcardDeck,
  flashcards, type Flashcard, type InsertFlashcard,
  exams, type Exam, type InsertExam,
  DEMO_USER_ID
} from "@shared/schema";

// Interface with all CRUD operations needed for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTasksByDate(userId: number, date: Date): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study session operations
  getStudySessions(userId: number): Promise<StudySession[]>;
  getStudySessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  endStudySession(id: number, endTime: Date): Promise<StudySession | undefined>;
  
  // Notes operations
  getNotes(userId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Flashcard deck operations
  getFlashcardDecks(userId: number): Promise<FlashcardDeck[]>;
  getFlashcardDeck(id: number): Promise<FlashcardDeck | undefined>;
  createFlashcardDeck(deck: InsertFlashcardDeck): Promise<FlashcardDeck>;
  updateFlashcardDeck(id: number, deck: Partial<InsertFlashcardDeck>): Promise<FlashcardDeck | undefined>;
  deleteFlashcardDeck(id: number): Promise<boolean>;
  
  // Flashcard operations
  getFlashcards(deckId: number): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<InsertFlashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  updateFlashcardMastery(id: number, masteryLevel: number): Promise<Flashcard | undefined>;
  
  // Exam operations
  getExams(userId: number): Promise<Exam[]>;
  getUpcomingExams(userId: number): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private studySessions: Map<number, StudySession>;
  private notes: Map<number, Note>;
  private flashcardDecks: Map<number, FlashcardDeck>;
  private flashcards: Map<number, Flashcard>;
  private exams: Map<number, Exam>;
  
  currentUserId: number;
  currentTaskId: number;
  currentSessionId: number;
  currentNoteId: number;
  currentDeckId: number;
  currentFlashcardId: number;
  currentExamId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.studySessions = new Map();
    this.notes = new Map();
    this.flashcardDecks = new Map();
    this.flashcards = new Map();
    this.exams = new Map();
    
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentSessionId = 1;
    this.currentNoteId = 1;
    this.currentDeckId = 1;
    this.currentFlashcardId = 1;
    this.currentExamId = 1;
    
    this.initializeWithDemoData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }
  
  async getTasksByDate(userId: number, date: Date): Promise<Task[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.tasks.values()).filter(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return task.userId === userId && taskDate === dateString;
    });
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Study session methods
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(session => session.userId === userId);
  }
  
  async getStudySessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(session => {
      const sessionDate = new Date(session.startTime);
      return session.userId === userId && 
             sessionDate >= startDate && 
             sessionDate <= endDate;
    });
  }
  
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.currentSessionId++;
    const newSession: StudySession = { ...session, id };
    this.studySessions.set(id, newSession);
    return newSession;
  }
  
  async endStudySession(id: number, endTime: Date): Promise<StudySession | undefined> {
    const existingSession = this.studySessions.get(id);
    if (!existingSession) return undefined;
    
    const startTime = new Date(existingSession.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    const updatedSession = { 
      ...existingSession, 
      endTime, 
      duration
    };
    
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Notes methods
  async getNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.userId === userId);
  }
  
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async createNote(note: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const now = new Date();
    const newNote: Note = { 
      ...note, 
      id, 
      createdAt: now, 
      updatedAt: now,
      keyPoints: note.keyPoints || []
    };
    this.notes.set(id, newNote);
    return newNote;
  }
  
  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return undefined;
    
    const updatedNote = { 
      ...existingNote, 
      ...note,
      updatedAt: new Date()
    };
    
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
  
  // Flashcard deck methods
  async getFlashcardDecks(userId: number): Promise<FlashcardDeck[]> {
    return Array.from(this.flashcardDecks.values()).filter(deck => deck.userId === userId);
  }
  
  async getFlashcardDeck(id: number): Promise<FlashcardDeck | undefined> {
    return this.flashcardDecks.get(id);
  }
  
  async createFlashcardDeck(deck: InsertFlashcardDeck): Promise<FlashcardDeck> {
    const id = this.currentDeckId++;
    const now = new Date();
    const newDeck: FlashcardDeck = { 
      ...deck, 
      id, 
      createdAt: now,
      lastStudied: null,
      cardsCount: 0,
      masteryLevel: 0
    };
    this.flashcardDecks.set(id, newDeck);
    return newDeck;
  }
  
  async updateFlashcardDeck(id: number, deck: Partial<InsertFlashcardDeck>): Promise<FlashcardDeck | undefined> {
    const existingDeck = this.flashcardDecks.get(id);
    if (!existingDeck) return undefined;
    
    const updatedDeck = { ...existingDeck, ...deck };
    this.flashcardDecks.set(id, updatedDeck);
    return updatedDeck;
  }
  
  async deleteFlashcardDeck(id: number): Promise<boolean> {
    // Also delete all flashcards belonging to this deck
    Array.from(this.flashcards.values())
      .filter(card => card.deckId === id)
      .forEach(card => this.flashcards.delete(card.id));
    
    return this.flashcardDecks.delete(id);
  }
  
  // Flashcard methods
  async getFlashcards(deckId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(card => card.deckId === deckId);
  }
  
  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }
  
  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const newFlashcard: Flashcard = { 
      ...flashcard, 
      id, 
      masteryLevel: 0,
      lastReviewed: null
    };
    this.flashcards.set(id, newFlashcard);
    
    // Update the card count in the deck
    const deck = this.flashcardDecks.get(flashcard.deckId);
    if (deck) {
      deck.cardsCount = (deck.cardsCount || 0) + 1;
      this.flashcardDecks.set(deck.id, deck);
    }
    
    return newFlashcard;
  }
  
  async updateFlashcard(id: number, flashcard: Partial<InsertFlashcard>): Promise<Flashcard | undefined> {
    const existingFlashcard = this.flashcards.get(id);
    if (!existingFlashcard) return undefined;
    
    const updatedFlashcard = { ...existingFlashcard, ...flashcard };
    this.flashcards.set(id, updatedFlashcard);
    return updatedFlashcard;
  }
  
  async deleteFlashcard(id: number): Promise<boolean> {
    const flashcard = this.flashcards.get(id);
    if (flashcard) {
      // Update the card count in the deck
      const deck = this.flashcardDecks.get(flashcard.deckId);
      if (deck && deck.cardsCount > 0) {
        deck.cardsCount--;
        this.flashcardDecks.set(deck.id, deck);
      }
    }
    
    return this.flashcards.delete(id);
  }
  
  async updateFlashcardMastery(id: number, masteryLevel: number): Promise<Flashcard | undefined> {
    const existingFlashcard = this.flashcards.get(id);
    if (!existingFlashcard) return undefined;
    
    const updatedFlashcard = { 
      ...existingFlashcard, 
      masteryLevel,
      lastReviewed: new Date()
    };
    
    this.flashcards.set(id, updatedFlashcard);
    
    // Update deck's lastStudied time and recalculate mastery level
    const deck = this.flashcardDecks.get(existingFlashcard.deckId);
    if (deck) {
      const deckCards = await this.getFlashcards(deck.id);
      const avgMastery = deckCards.reduce((sum, card) => sum + card.masteryLevel, 0) / deckCards.length;
      
      deck.lastStudied = new Date();
      deck.masteryLevel = Math.round(avgMastery);
      
      this.flashcardDecks.set(deck.id, deck);
    }
    
    return updatedFlashcard;
  }
  
  // Exam methods
  async getExams(userId: number): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(exam => exam.userId === userId);
  }
  
  async getUpcomingExams(userId: number): Promise<Exam[]> {
    const now = new Date();
    return Array.from(this.exams.values()).filter(exam => {
      return exam.userId === userId && new Date(exam.date) >= now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async createExam(exam: InsertExam): Promise<Exam> {
    const id = this.currentExamId++;
    const newExam: Exam = { ...exam, id };
    this.exams.set(id, newExam);
    return newExam;
  }
  
  async updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam | undefined> {
    const existingExam = this.exams.get(id);
    if (!existingExam) return undefined;
    
    const updatedExam = { ...existingExam, ...exam };
    this.exams.set(id, updatedExam);
    return updatedExam;
  }
  
  async deleteExam(id: number): Promise<boolean> {
    return this.exams.delete(id);
  }
  
  // Initialize with demo data
  private initializeWithDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: DEMO_USER_ID,
      username: "demouser",
      password: "password",
      fullName: "John Smith",
      email: "john@example.com"
    };
    this.users.set(demoUser.id, demoUser);
    this.currentUserId = 2; // Next user will be ID 2
    
    // Create demo tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const demoTasks: Task[] = [
      {
        id: 1,
        userId: DEMO_USER_ID,
        title: "Calculus II - Integrals",
        description: "Chapter 5 review and practice problems",
        dueDate: today,
        startTime: "9:00",
        duration: 90,
        completed: false,
        priority: "high",
        subject: "Mathematics"
      },
      {
        id: 2,
        userId: DEMO_USER_ID,
        title: "Computer Science - Algorithms",
        description: "Sorting algorithms practice",
        dueDate: today,
        startTime: "11:00",
        duration: 60,
        completed: false,
        priority: "medium",
        subject: "Computer Science"
      },
      {
        id: 3,
        userId: DEMO_USER_ID,
        title: "Physics - Electromagnetism",
        description: "Review lecture notes and prepare for lab",
        dueDate: today,
        startTime: "14:00",
        duration: 120,
        completed: false,
        priority: "medium",
        subject: "Physics"
      },
      {
        id: 4,
        userId: DEMO_USER_ID,
        title: "Calculus II - Derivatives Review",
        description: "Practice problems from textbook",
        dueDate: tomorrow,
        startTime: "10:00",
        duration: 120,
        completed: false,
        priority: "medium",
        subject: "Mathematics"
      }
    ];
    
    demoTasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
    this.currentTaskId = 5;
    
    // Create demo study sessions (some completed, some ongoing)
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const demoSessions: StudySession[] = [
      {
        id: 1,
        userId: DEMO_USER_ID,
        taskId: 1,
        startTime: new Date(today.setHours(8, 0, 0, 0)),
        endTime: new Date(today.setHours(9, 30, 0, 0)),
        duration: 90,
        subject: "Mathematics",
        notes: "Covered integration by parts and substitution"
      },
      {
        id: 2,
        userId: DEMO_USER_ID,
        taskId: null,
        startTime: new Date(lastWeek.setHours(14, 0, 0, 0)),
        endTime: new Date(lastWeek.setHours(16, 0, 0, 0)),
        duration: 120,
        subject: "Computer Science",
        notes: "Practiced quicksort and mergesort implementations"
      }
    ];
    
    demoSessions.forEach(session => {
      this.studySessions.set(session.id, session);
    });
    this.currentSessionId = 3;
    
    // Create demo notes
    const demoNotes: Note[] = [
      {
        id: 1,
        userId: DEMO_USER_ID,
        title: "Integration Techniques",
        content: "# Integration Techniques\n\n## Integration by Parts\nThe formula is: ∫u dv = uv - ∫v du\n\nThis is useful when integrating products of functions.\n\n## Integration by Substitution\nSubstitute u = g(x) and du = g'(x) dx to simplify integrals.\n\n## Partial Fractions\nBreak down rational functions into simpler fractions.",
        subject: "Mathematics",
        createdAt: new Date(lastWeek),
        updatedAt: new Date(lastWeek),
        keyPoints: ["Integration by Parts", "Substitution Method", "Partial Fractions"]
      },
      {
        id: 2,
        userId: DEMO_USER_ID,
        title: "Sorting Algorithms",
        content: "# Sorting Algorithms\n\n## Quick Sort\nAverage time complexity: O(n log n)\nWorst case: O(n²)\n\n```\nfunction quickSort(arr, low, high) {\n  if (low < high) {\n    let pivot = partition(arr, low, high);\n    quickSort(arr, low, pivot - 1);\n    quickSort(arr, pivot + 1, high);\n  }\n}\n```\n\n## Merge Sort\nTime complexity: O(n log n) in all cases\nSpace complexity: O(n)",
        subject: "Computer Science",
        createdAt: new Date(lastWeek),
        updatedAt: new Date(today),
        keyPoints: ["Quick Sort", "Merge Sort", "Time Complexity"]
      }
    ];
    
    demoNotes.forEach(note => {
      this.notes.set(note.id, note);
    });
    this.currentNoteId = 3;
    
    // Create demo flashcard decks
    const demoDecks: FlashcardDeck[] = [
      {
        id: 1,
        userId: DEMO_USER_ID,
        title: "Calculus II Formulas",
        description: "Integration techniques and applications",
        subject: "Mathematics",
        createdAt: new Date(lastWeek),
        lastStudied: new Date(today.setDate(today.getDate() - 2)),
        cardsCount: 3,
        masteryLevel: 76
      },
      {
        id: 2,
        userId: DEMO_USER_ID,
        title: "Physics - Electromagnetism",
        description: "Maxwell's equations and applications",
        subject: "Physics",
        createdAt: new Date(lastWeek),
        lastStudied: new Date(today.setDate(today.getDate() - 5)),
        cardsCount: 2,
        masteryLevel: 43
      }
    ];
    
    demoDecks.forEach(deck => {
      this.flashcardDecks.set(deck.id, deck);
    });
    this.currentDeckId = 3;
    
    // Create demo flashcards
    const demoFlashcards: Flashcard[] = [
      {
        id: 1,
        deckId: 1,
        front: "What is the formula for integration by parts?",
        back: "∫u dv = uv - ∫v du",
        masteryLevel: 90,
        lastReviewed: new Date(today.setDate(today.getDate() - 2))
      },
      {
        id: 2,
        deckId: 1,
        front: "When do you use integration by substitution?",
        back: "When the integrand can be rewritten in the form ∫f(g(x))g'(x)dx, allowing the substitution u = g(x)",
        masteryLevel: 75,
        lastReviewed: new Date(today.setDate(today.getDate() - 2))
      },
      {
        id: 3,
        deckId: 1,
        front: "What is the partial fractions decomposition used for?",
        back: "To integrate rational functions by breaking them down into simpler fractions that are easier to integrate",
        masteryLevel: 60,
        lastReviewed: new Date(today.setDate(today.getDate() - 2))
      },
      {
        id: 4,
        deckId: 2,
        front: "What are Maxwell's four equations?",
        back: "1. Gauss's law for electricity\n2. Gauss's law for magnetism\n3. Faraday's law of induction\n4. Ampère's law with Maxwell's correction",
        masteryLevel: 50,
        lastReviewed: new Date(today.setDate(today.getDate() - 5))
      },
      {
        id: 5,
        deckId: 2,
        front: "What does Faraday's law of induction state?",
        back: "The induced electromotive force (EMF) in a closed circuit is equal to the negative of the time rate of change of magnetic flux through the circuit",
        masteryLevel: 35,
        lastReviewed: new Date(today.setDate(today.getDate() - 5))
      }
    ];
    
    demoFlashcards.forEach(card => {
      this.flashcards.set(card.id, card);
    });
    this.currentFlashcardId = 6;
    
    // Create demo exams
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 26);
    
    const demoExams: Exam[] = [
      {
        id: 1,
        userId: DEMO_USER_ID,
        title: "Calculus II Midterm",
        subject: "Mathematics",
        date: nextWeek,
        description: "Covers integration techniques and applications"
      },
      {
        id: 2,
        userId: DEMO_USER_ID,
        title: "Computer Science Final",
        subject: "Computer Science",
        date: nextMonth,
        description: "Comprehensive exam covering all course material"
      }
    ];
    
    demoExams.forEach(exam => {
      this.exams.set(exam.id, exam);
    });
    this.currentExamId = 3;
  }
}

export const storage = new MemStorage();
