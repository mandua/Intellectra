import { apiRequest } from "./queryClient";

export interface AIRecommendation {
  icon: string;
  title: string;
  description: string;
  type: "productivity" | "subject" | "collaboration";
}

export interface ProductivityData {
  timeBlocks: number[];
  subjects: { name: string; progress: number }[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface EnhancedNote {
  enhancedContent: string;
  keyPoints: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

/**
 * Get AI-generated study recommendations
 */
export async function getStudyRecommendations(
  productivityData: ProductivityData
): Promise<AIRecommendation[]> {
  try {
    const res = await apiRequest("POST", "/api/ai/recommendations", {
      productivityData: productivityData.timeBlocks,
      subjects: productivityData.subjects.map((s) => s.name),
    });
    
    const data = await res.json();
    return data.recommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

/**
 * Generate flashcards from note content
 */
export async function generateFlashcardsFromNotes(
  noteContent: string,
  subject: string,
  count: number = 5
): Promise<Flashcard[]> {
  try {
    const res = await apiRequest("POST", "/api/ai/flashcards/generate", {
      noteContent,
      subject,
      count,
    });
    
    const data = await res.json();
    return data.flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
}

/**
 * Enhance note content with AI
 */
export async function enhanceNotes(
  noteContent: string
): Promise<EnhancedNote> {
  try {
    const res = await apiRequest("POST", "/api/ai/notes/enhance", {
      noteContent,
    });
    
    return await res.json();
  } catch (error) {
    console.error("Error enhancing notes:", error);
    return {
      enhancedContent: noteContent,
      keyPoints: [],
    };
  }
}

/**
 * Generate quiz questions from a flashcard deck
 */
export async function generateQuiz(
  deckId: number,
  count: number = 5
): Promise<QuizQuestion[]> {
  try {
    const res = await apiRequest("POST", "/api/ai/quiz/generate", {
      deckId,
      count,
    });
    
    const data = await res.json();
    return data.quiz;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}

export default {
  getStudyRecommendations,
  generateFlashcardsFromNotes,
  enhanceNotes,
  generateQuiz,
};
