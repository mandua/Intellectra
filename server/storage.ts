import { 
  users, 
  tasks, 
  studySessions, 
  notes, 
  flashcardSets, 
  flashcards, 
  studyProgress,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type StudySession,
  type InsertStudySession,
  type Note,
  type InsertNote,
  type FlashcardSet,
  type InsertFlashcardSet,
  type Flashcard,
  type InsertFlashcard,
  type StudyProgress,
  type InsertStudyProgress
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study session operations
  getStudySessions(userId: number): Promise<StudySession[]>;
  getStudySessionById(id: number): Promise<StudySession | undefined>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
  
  // Note operations
  getNotes(userId: number): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Flashcard set operations
  getFlashcardSets(userId: number): Promise<FlashcardSet[]>;
  getFlashcardSetById(id: number): Promise<FlashcardSet | undefined>;
  createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet>;
  updateFlashcardSet(id: number, set: Partial<FlashcardSet>): Promise<FlashcardSet | undefined>;
  deleteFlashcardSet(id: number): Promise<boolean>;
  
  // Flashcard operations
  getFlashcards(setId: number): Promise<Flashcard[]>;
  getFlashcardById(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  
  // Study progress operations
  getStudyProgress(userId: number): Promise<StudyProgress[]>;
  createStudyProgress(progress: InsertStudyProgress): Promise<StudyProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private studySessions: Map<number, StudySession>;
  private notes: Map<number, Note>;
  private flashcardSets: Map<number, FlashcardSet>;
  private flashcards: Map<number, Flashcard>;
  private studyProgress: Map<number, StudyProgress>;
  
  // ID counters for each entity
  private userIdCounter: number;
  private taskIdCounter: number;
  private sessionIdCounter: number;
  private noteIdCounter: number;
  private setIdCounter: number;
  private flashcardIdCounter: number;
  private progressIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.studySessions = new Map();
    this.notes = new Map();
    this.flashcardSets = new Map();
    this.flashcards = new Map();
    this.studyProgress = new Map();
    
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.sessionIdCounter = 1;
    this.noteIdCounter = 1;
    this.setIdCounter = 1;
    this.flashcardIdCounter = 1;
    this.progressIdCounter = 1;
    
    // Add a default user
    this.createUser({
      username: "alexjohnson",
      password: "password123",
      name: "Alex Johnson",
      email: "alex@example.com",
      major: "Computer Science",
      avatarUrl: ""
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Study session operations
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  async getStudySessionById(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.sessionIdCounter++;
    const newSession: StudySession = { ...session, id };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async updateStudySession(id: number, sessionUpdate: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionUpdate };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }

  // Note operations
  async getNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId,
    );
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const now = new Date();
    const newNote: Note = { 
      ...note, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: number, noteUpdate: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { 
      ...note, 
      ...noteUpdate,
      updatedAt: new Date()
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Flashcard set operations
  async getFlashcardSets(userId: number): Promise<FlashcardSet[]> {
    return Array.from(this.flashcardSets.values()).filter(
      (set) => set.userId === userId,
    );
  }

  async getFlashcardSetById(id: number): Promise<FlashcardSet | undefined> {
    return this.flashcardSets.get(id);
  }

  async createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet> {
    const id = this.setIdCounter++;
    const now = new Date();
    const newSet: FlashcardSet = { 
      ...set, 
      id, 
      createdAt: now
    };
    this.flashcardSets.set(id, newSet);
    return newSet;
  }

  async updateFlashcardSet(id: number, setUpdate: Partial<FlashcardSet>): Promise<FlashcardSet | undefined> {
    const set = this.flashcardSets.get(id);
    if (!set) return undefined;
    
    const updatedSet = { 
      ...set, 
      ...setUpdate
    };
    this.flashcardSets.set(id, updatedSet);
    return updatedSet;
  }

  async deleteFlashcardSet(id: number): Promise<boolean> {
    // Also delete all flashcards belonging to this set
    Array.from(this.flashcards.values())
      .filter(card => card.setId === id)
      .forEach(card => this.flashcards.delete(card.id));
    
    return this.flashcardSets.delete(id);
  }

  // Flashcard operations
  async getFlashcards(setId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (card) => card.setId === setId,
    );
  }

  async getFlashcardById(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.flashcardIdCounter++;
    const newCard: Flashcard = { ...flashcard, id };
    this.flashcards.set(id, newCard);
    return newCard;
  }

  async updateFlashcard(id: number, cardUpdate: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const card = this.flashcards.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...cardUpdate };
    this.flashcards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    return this.flashcards.delete(id);
  }

  // Study progress operations
  async getStudyProgress(userId: number): Promise<StudyProgress[]> {
    return Array.from(this.studyProgress.values()).filter(
      (progress) => progress.userId === userId,
    );
  }

  async createStudyProgress(progress: InsertStudyProgress): Promise<StudyProgress> {
    const id = this.progressIdCounter++;
    const newProgress: StudyProgress = { ...progress, id };
    this.studyProgress.set(id, newProgress);
    return newProgress;
  }
}

// Create and export a shared instance of the storage
export const storage = new MemStorage();

// Initialize with sample data
const initializeStorage = async () => {
  const user = await storage.getUserByUsername("alexjohnson");
  if (!user) return;
  
  // Create demo tasks
  await storage.createTask({
    userId: user.id,
    title: "Complete ML Project",
    description: "Finalize the machine learning project with classification model",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    priority: 1, // high
    completed: false,
    category: "Projects"
  });
  
  await storage.createTask({
    userId: user.id,
    title: "Study for Database Exam",
    description: "Review SQL queries, normalization, and indexing",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    priority: 2, // medium
    completed: false,
    category: "Exams"
  });
  
  await storage.createTask({
    userId: user.id,
    title: "Review Lecture Notes",
    description: "Go through the notes from last week's lectures",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    priority: 3, // low
    completed: false,
    category: "Review"
  });
  
  await storage.createTask({
    userId: user.id,
    title: "Research Paper Outline",
    description: "Create an outline for the upcoming research paper",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    priority: 3, // low
    completed: false,
    category: "Papers"
  });
  
  // Create study sessions
  const today = new Date();
  
  await storage.createStudySession({
    userId: user.id,
    title: "Data Structures Lecture",
    startTime: new Date(today.setHours(9, 0, 0, 0)),
    endTime: new Date(today.setHours(10, 30, 0, 0)),
    subject: "Computer Science",
    description: "Lecture on advanced data structures",
    location: "Room 302, Engineering Building"
  });
  
  await storage.createStudySession({
    userId: user.id,
    title: "Study Group - Algorithms",
    startTime: new Date(today.setHours(11, 30, 0, 0)),
    endTime: new Date(today.setHours(13, 0, 0, 0)),
    subject: "Computer Science",
    description: "Group study for algorithm optimization",
    location: "Library Study Room 4"
  });
  
  await storage.createStudySession({
    userId: user.id,
    title: "Assignment Review - AI Ethics",
    startTime: new Date(today.setHours(14, 0, 0, 0)),
    endTime: new Date(today.setHours(15, 0, 0, 0)),
    subject: "AI Ethics",
    description: "Review session for the AI ethics assignment",
    location: "Zoom Meeting"
  });
  
  // Create flashcard sets
  const dsaSet = await storage.createFlashcardSet({
    userId: user.id,
    title: "Data Structures & Algorithms",
    description: "Flashcards for DSA course",
    subject: "Computer Science",
    tags: ["algorithms", "data structures", "complexity"]
  });
  
  const archSet = await storage.createFlashcardSet({
    userId: user.id,
    title: "Computer Architecture",
    description: "Flashcards for Computer Architecture class",
    subject: "Computer Science",
    tags: ["cpu", "memory", "architecture"]
  });
  
  // Create flashcards
  await storage.createFlashcard({
    setId: dsaSet.id,
    question: "What is the time complexity of QuickSort in the worst case?",
    answer: "O(n²) - This occurs when the pivot selection is poor, such as when the array is already sorted.",
    proficiency: 2
  });
  
  await storage.createFlashcard({
    setId: archSet.id,
    question: "What are the four main components of a CPU?",
    answer: "1. Arithmetic Logic Unit (ALU)\n2. Control Unit\n3. Registers\n4. Cache",
    proficiency: 3
  });
  
  // Create study progress entries
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    
    // Randomize study duration between 30 and 240 minutes
    const minutes = Math.floor(Math.random() * 211) + 30;
    
    await storage.createStudyProgress({
      userId: user.id,
      date,
      studyDuration: minutes,
      subject: "Various",
      notes: `Study session on day ${i+1}`
    });
  }
};

// Initialize the storage with sample data
initializeStorage();
