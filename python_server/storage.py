from datetime import datetime
from copy import deepcopy
from typing import Dict, List, Optional, Any, TypedDict, Union

# Type definitions
class User(TypedDict):
    id: int
    username: str
    password: str
    name: str
    email: str
    major: Optional[str]
    avatarUrl: Optional[str]

class InsertUser(TypedDict):
    username: str
    password: str
    name: str
    email: str
    major: Optional[str]
    avatarUrl: Optional[str]

class Task(TypedDict):
    id: int
    userId: int
    title: str
    description: Optional[str]
    dueDate: Optional[str]
    priority: int  # 1 = high, 2 = medium, 3 = low
    completed: bool
    category: Optional[str]

class InsertTask(TypedDict):
    userId: int
    title: str
    description: Optional[str]
    dueDate: Optional[str]
    priority: int
    completed: bool
    category: Optional[str]

class StudySession(TypedDict):
    id: int
    userId: int
    title: str
    startTime: str
    endTime: Optional[str]
    subject: Optional[str]
    description: Optional[str]
    location: Optional[str]

class InsertStudySession(TypedDict):
    userId: int
    title: str
    startTime: str
    endTime: Optional[str]
    subject: Optional[str]
    description: Optional[str]
    location: Optional[str]

class Note(TypedDict):
    id: int
    userId: int
    title: str
    content: str
    subject: Optional[str]
    tags: Optional[List[str]]
    createdAt: Union[str, datetime]
    updatedAt: Union[str, datetime]

class InsertNote(TypedDict):
    userId: int
    title: str
    content: str
    subject: Optional[str]
    tags: Optional[List[str]]

class FlashcardSet(TypedDict):
    id: int
    userId: int
    title: str
    description: Optional[str]
    subject: Optional[str]
    tags: Optional[List[str]]
    createdAt: Union[str, datetime]

class InsertFlashcardSet(TypedDict):
    userId: int
    title: str
    description: Optional[str]
    subject: Optional[str]
    tags: Optional[List[str]]

class Flashcard(TypedDict):
    id: int
    setId: int
    question: str
    answer: str
    lastReviewed: Optional[str]
    proficiency: Optional[int]  # 0-4 scale for spaced repetition

class InsertFlashcard(TypedDict):
    setId: int
    question: str
    answer: str
    lastReviewed: Optional[str]
    proficiency: Optional[int]

class StudyProgress(TypedDict):
    id: int
    userId: int
    date: Union[str, datetime]
    studyDuration: int  # in minutes
    subject: Optional[str]
    notes: Optional[str]

class InsertStudyProgress(TypedDict):
    userId: int
    date: Union[str, datetime]
    studyDuration: int
    subject: Optional[str]
    notes: Optional[str]

# Interface for storage operations
class IStorage:
    # User operations
    def get_user(self, id: int) -> Optional[User]: pass
    def get_user_by_username(self, username: str) -> Optional[User]: pass
    def create_user(self, user: InsertUser) -> User: pass
    
    # Task operations
    def get_tasks(self, user_id: int) -> List[Task]: pass
    def get_task_by_id(self, id: int) -> Optional[Task]: pass
    def create_task(self, task: InsertTask) -> Task: pass
    def update_task(self, id: int, task: Dict[str, Any]) -> Optional[Task]: pass
    def delete_task(self, id: int) -> bool: pass
    
    # Study session operations
    def get_study_sessions(self, user_id: int) -> List[StudySession]: pass
    def get_study_session_by_id(self, id: int) -> Optional[StudySession]: pass
    def create_study_session(self, session: InsertStudySession) -> StudySession: pass
    def update_study_session(self, id: int, session: Dict[str, Any]) -> Optional[StudySession]: pass
    def delete_study_session(self, id: int) -> bool: pass
    
    # Note operations
    def get_notes(self, user_id: int) -> List[Note]: pass
    def get_note_by_id(self, id: int) -> Optional[Note]: pass
    def create_note(self, note: InsertNote) -> Note: pass
    def update_note(self, id: int, note: Dict[str, Any]) -> Optional[Note]: pass
    def delete_note(self, id: int) -> bool: pass
    
    # Flashcard set operations
    def get_flashcard_sets(self, user_id: int) -> List[FlashcardSet]: pass
    def get_flashcard_set_by_id(self, id: int) -> Optional[FlashcardSet]: pass
    def create_flashcard_set(self, set: InsertFlashcardSet) -> FlashcardSet: pass
    def update_flashcard_set(self, id: int, set: Dict[str, Any]) -> Optional[FlashcardSet]: pass
    def delete_flashcard_set(self, id: int) -> bool: pass
    
    # Flashcard operations
    def get_flashcards(self, set_id: int) -> List[Flashcard]: pass
    def get_flashcard_by_id(self, id: int) -> Optional[Flashcard]: pass
    def create_flashcard(self, flashcard: InsertFlashcard) -> Flashcard: pass
    def update_flashcard(self, id: int, flashcard: Dict[str, Any]) -> Optional[Flashcard]: pass
    def delete_flashcard(self, id: int) -> bool: pass
    
    # Study progress operations
    def get_study_progress(self, user_id: int) -> List[StudyProgress]: pass
    def create_study_progress(self, progress: InsertStudyProgress) -> StudyProgress: pass

class MemStorage(IStorage):
    def __init__(self):
        self.users: Dict[int, User] = {}
        self.tasks: Dict[int, Task] = {}
        self.study_sessions: Dict[int, StudySession] = {}
        self.notes: Dict[int, Note] = {}
        self.flashcard_sets: Dict[int, FlashcardSet] = {}
        self.flashcards: Dict[int, Flashcard] = {}
        self.study_progress: Dict[int, StudyProgress] = {}
        
        # ID counters for each entity
        self.user_id_counter = 1
        self.task_id_counter = 1
        self.session_id_counter = 1
        self.note_id_counter = 1
        self.set_id_counter = 1
        self.flashcard_id_counter = 1
        self.progress_id_counter = 1
        
        # Add a default user
        self.create_user({
            "username": "alexjohnson",
            "password": "password123",
            "name": "Alex Johnson",
            "email": "alex@example.com",
            "major": "Computer Science",
            "avatarUrl": ""
        })

    # User operations
    def get_user(self, id: int) -> Optional[User]:
        return self.users.get(id)

    def get_user_by_username(self, username: str) -> Optional[User]:
        for user in self.users.values():
            if user["username"] == username:
                return user
        return None

    def create_user(self, user: InsertUser) -> User:
        id = self.user_id_counter
        self.user_id_counter += 1
        new_user: User = {**user, "id": id}
        self.users[id] = new_user
        return new_user

    # Task operations
    def get_tasks(self, user_id: int) -> List[Task]:
        return [task for task in self.tasks.values() if task["userId"] == user_id]

    def get_task_by_id(self, id: int) -> Optional[Task]:
        return self.tasks.get(id)

    def create_task(self, task: InsertTask) -> Task:
        id = self.task_id_counter
        self.task_id_counter += 1
        new_task: Task = {**task, "id": id}
        self.tasks[id] = new_task
        return new_task

    def update_task(self, id: int, task_update: Dict[str, Any]) -> Optional[Task]:
        task = self.tasks.get(id)
        if not task:
            return None
        
        updated_task = {**task, **task_update}
        self.tasks[id] = updated_task
        return updated_task

    def delete_task(self, id: int) -> bool:
        if id in self.tasks:
            del self.tasks[id]
            return True
        return False

    # Study session operations
    def get_study_sessions(self, user_id: int) -> List[StudySession]:
        return [session for session in self.study_sessions.values() if session["userId"] == user_id]

    def get_study_session_by_id(self, id: int) -> Optional[StudySession]:
        return self.study_sessions.get(id)

    def create_study_session(self, session: InsertStudySession) -> StudySession:
        id = self.session_id_counter
        self.session_id_counter += 1
        new_session: StudySession = {**session, "id": id}
        self.study_sessions[id] = new_session
        return new_session

    def update_study_session(self, id: int, session_update: Dict[str, Any]) -> Optional[StudySession]:
        session = self.study_sessions.get(id)
        if not session:
            return None
        
        updated_session = {**session, **session_update}
        self.study_sessions[id] = updated_session
        return updated_session

    def delete_study_session(self, id: int) -> bool:
        if id in self.study_sessions:
            del self.study_sessions[id]
            return True
        return False

    # Note operations
    def get_notes(self, user_id: int) -> List[Note]:
        return [note for note in self.notes.values() if note["userId"] == user_id]

    def get_note_by_id(self, id: int) -> Optional[Note]:
        return self.notes.get(id)

    def create_note(self, note: InsertNote) -> Note:
        id = self.note_id_counter
        self.note_id_counter += 1
        now = datetime.now().isoformat()
        new_note: Note = {
            **note,
            "id": id,
            "createdAt": now,
            "updatedAt": now
        }
        self.notes[id] = new_note
        return new_note

    def update_note(self, id: int, note_update: Dict[str, Any]) -> Optional[Note]:
        note = self.notes.get(id)
        if not note:
            return None
        
        updated_note = {
            **note,
            **note_update,
            "updatedAt": datetime.now().isoformat()
        }
        self.notes[id] = updated_note
        return updated_note

    def delete_note(self, id: int) -> bool:
        if id in self.notes:
            del self.notes[id]
            return True
        return False

    # Flashcard set operations
    def get_flashcard_sets(self, user_id: int) -> List[FlashcardSet]:
        return [set for set in self.flashcard_sets.values() if set["userId"] == user_id]

    def get_flashcard_set_by_id(self, id: int) -> Optional[FlashcardSet]:
        return self.flashcard_sets.get(id)

    def create_flashcard_set(self, set: InsertFlashcardSet) -> FlashcardSet:
        id = self.set_id_counter
        self.set_id_counter += 1
        now = datetime.now().isoformat()
        new_set: FlashcardSet = {
            **set,
            "id": id,
            "createdAt": now
        }
        self.flashcard_sets[id] = new_set
        return new_set

    def update_flashcard_set(self, id: int, set_update: Dict[str, Any]) -> Optional[FlashcardSet]:
        set_data = self.flashcard_sets.get(id)
        if not set_data:
            return None
        
        updated_set = {**set_data, **set_update}
        self.flashcard_sets[id] = updated_set
        return updated_set

    def delete_flashcard_set(self, id: int) -> bool:
        # Also delete all flashcards belonging to this set
        flashcards_to_delete = [card_id for card_id, card in self.flashcards.items() if card["setId"] == id]
        for card_id in flashcards_to_delete:
            del self.flashcards[card_id]
        
        if id in self.flashcard_sets:
            del self.flashcard_sets[id]
            return True
        return False

    # Flashcard operations
    def get_flashcards(self, set_id: int) -> List[Flashcard]:
        return [card for card in self.flashcards.values() if card["setId"] == set_id]

    def get_flashcard_by_id(self, id: int) -> Optional[Flashcard]:
        return self.flashcards.get(id)

    def create_flashcard(self, flashcard: InsertFlashcard) -> Flashcard:
        id = self.flashcard_id_counter
        self.flashcard_id_counter += 1
        new_card: Flashcard = {**flashcard, "id": id}
        self.flashcards[id] = new_card
        return new_card

    def update_flashcard(self, id: int, card_update: Dict[str, Any]) -> Optional[Flashcard]:
        card = self.flashcards.get(id)
        if not card:
            return None
        
        updated_card = {**card, **card_update}
        self.flashcards[id] = updated_card
        return updated_card

    def delete_flashcard(self, id: int) -> bool:
        if id in self.flashcards:
            del self.flashcards[id]
            return True
        return False

    # Study progress operations
    def get_study_progress(self, user_id: int) -> List[StudyProgress]:
        return [progress for progress in self.study_progress.values() if progress["userId"] == user_id]

    def create_study_progress(self, progress: InsertStudyProgress) -> StudyProgress:
        id = self.progress_id_counter
        self.progress_id_counter += 1
        new_progress: StudyProgress = {**progress, "id": id}
        self.study_progress[id] = new_progress
        return new_progress

# Create and export a shared instance of the storage
storage = MemStorage()

# Initialize with sample data
def initialize_storage():
    user = storage.get_user_by_username("alexjohnson")
    if not user:
        return
    
    # Create demo tasks
    storage.create_task({
        "userId": user["id"],
        "title": "Complete ML Project",
        "description": "Finalize the machine learning project with classification model",
        "dueDate": (datetime.now().timestamp() + 24 * 60 * 60) * 1000,  # tomorrow
        "priority": 1,  # high
        "completed": False,
        "category": "Projects"
    })
    
    storage.create_task({
        "userId": user["id"],
        "title": "Study for Database Exam",
        "description": "Review SQL queries, normalization, and indexing",
        "dueDate": (datetime.now().timestamp() + 3 * 24 * 60 * 60) * 1000,  # 3 days
        "priority": 2,  # medium
        "completed": False,
        "category": "Exams"
    })
    
    storage.create_task({
        "userId": user["id"],
        "title": "Review Lecture Notes",
        "description": "Go through the notes from last week's lectures",
        "dueDate": (datetime.now().timestamp() + 5 * 24 * 60 * 60) * 1000,  # 5 days
        "priority": 3,  # low
        "completed": False,
        "category": "Review"
    })
    
    storage.create_task({
        "userId": user["id"],
        "title": "Research Paper Outline",
        "description": "Create an outline for the upcoming research paper",
        "dueDate": (datetime.now().timestamp() + 7 * 24 * 60 * 60) * 1000,  # 7 days
        "priority": 3,  # low
        "completed": False,
        "category": "Papers"
    })
    
    # Create study sessions
    today = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    
    storage.create_study_session({
        "userId": user["id"],
        "title": "Data Structures Lecture",
        "startTime": today.isoformat(),
        "endTime": today.replace(hour=10, minute=30).isoformat(),
        "subject": "Computer Science",
        "description": "Lecture on advanced data structures",
        "location": "Room 302, Engineering Building"
    })
    
    storage.create_study_session({
        "userId": user["id"],
        "title": "Study Group - Algorithms",
        "startTime": today.replace(hour=11, minute=30).isoformat(),
        "endTime": today.replace(hour=13, minute=0).isoformat(),
        "subject": "Computer Science",
        "description": "Group study for algorithm optimization",
        "location": "Library Study Room 4"
    })
    
    storage.create_study_session({
        "userId": user["id"],
        "title": "Assignment Review - AI Ethics",
        "startTime": today.replace(hour=14, minute=0).isoformat(),
        "endTime": today.replace(hour=15, minute=0).isoformat(),
        "subject": "AI Ethics",
        "description": "Review session for the AI ethics assignment",
        "location": "Zoom Meeting"
    })
    
    # Create flashcard sets
    dsa_set = storage.create_flashcard_set({
        "userId": user["id"],
        "title": "Data Structures & Algorithms",
        "description": "Flashcards for DSA course",
        "subject": "Computer Science",
        "tags": ["algorithms", "data structures", "complexity"]
    })
    
    arch_set = storage.create_flashcard_set({
        "userId": user["id"],
        "title": "Computer Architecture",
        "description": "Flashcards for Computer Architecture class",
        "subject": "Computer Science",
        "tags": ["cpu", "memory", "architecture"]
    })
    
    # Create flashcards
    storage.create_flashcard({
        "setId": dsa_set["id"],
        "question": "What is the time complexity of QuickSort in the worst case?",
        "answer": "O(n²) - This occurs when the pivot selection is poor, such as when the array is already sorted.",
        "proficiency": 2
    })
    
    storage.create_flashcard({
        "setId": arch_set["id"],
        "question": "What are the four main components of a CPU?",
        "answer": "1. Arithmetic Logic Unit (ALU)\n2. Control Unit\n3. Registers\n4. Cache",
        "proficiency": 3
    })
    
    # Create study progress entries
    import datetime as dt
    from datetime import date
    from random import randint
    
    for i in range(7):
        # Calculate date for each entry, starting 6 days ago
        entry_date = date.today() - dt.timedelta(days=6-i)
        
        # Randomize study duration between 30 and 240 minutes
        minutes = randint(30, 240)
        
        storage.create_study_progress({
            "userId": user["id"],
            "date": entry_date.isoformat(),
            "studyDuration": minutes,
            "subject": "Various",
            "notes": f"Study session on day {i+1}"
        })

# Initialize the storage with sample data
initialize_storage()