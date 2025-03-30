import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIRecommendation } from "@/lib/ai";
import { Flashcard } from "@shared/schema";

// Initialize Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Use the Gemini-Pro model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Generate study recommendations based on productivity data
 */
export async function generateStudyRecommendations(
  timeBlocks: number[],
  subjects: string[]
): Promise<AIRecommendation[]> {
  const prompt = `
    Based on the student's productivity data:
    - Time blocks: ${timeBlocks.join(", ")} (where higher numbers indicate better productivity in that time slot)
    - Subjects: ${subjects.join(", ")}
    
    Generate 4 personalized study recommendations for the student. 
    Each recommendation should include:
    - An icon name (use common material icon names like "schedule", "school", "auto_stories", "lightbulb")
    - A concise title (maximum 5 words)
    - A brief, helpful description (1-2 sentences)
    - A type category (must be exactly one of: "productivity", "subject", or "collaboration")
    
    Format your response as a valid JSON array of recommendation objects.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON part from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse recommendations from AI response");
    }

    const recommendations = JSON.parse(jsonMatch[0]) as AIRecommendation[];
    return recommendations.slice(0, 4); // Ensure we return at most 4 recommendations
  } catch (error) {
    console.error("Error generating study recommendations:", error);
    // Return fallback recommendations in case of an error
    return defaultRecommendations();
  }
}

/**
 * Generate flashcards from note content
 */
export async function generateFlashcardsFromNotes(
  noteContent: string, 
  subject: string, 
  count: number = 5
): Promise<{front: string, back: string}[]> {
  const prompt = `
    Create ${count} flashcards based on the following ${subject} notes:
    
    ${noteContent}
    
    Each flashcard should have:
    - A front side with a clear question, concept, or term
    - A back side with a comprehensive answer or explanation
    
    Format your response as a valid JSON array of flashcard objects, where each object has "front" and "back" properties.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON part from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse flashcards from AI response");
    }

    const flashcards = JSON.parse(jsonMatch[0]) as {front: string, back: string}[];
    return flashcards.slice(0, count);
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
): Promise<{enhancedContent: string, keyPoints: string[]}> {
  const prompt = `
    Enhance the following student note:
    
    ${noteContent}
    
    Provide:
    1. An improved version of the note with better organization, clarity, and additional relevant details if needed
    2. A list of 3-5 key points from the note
    
    Format your response as a valid JSON object with properties "enhancedContent" (string) and "keyPoints" (array of strings).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON part from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse enhanced notes from AI response");
    }

    return JSON.parse(jsonMatch[0]) as {enhancedContent: string, keyPoints: string[]};
  } catch (error) {
    console.error("Error enhancing notes:", error);
    return {
      enhancedContent: noteContent,
      keyPoints: []
    };
  }
}

/**
 * Generate quiz questions from flashcards
 */
export async function generateQuizQuestions(
  deckId: number, 
  flashcards: Flashcard[], 
  count: number = 5
): Promise<any[]> {
  if (!flashcards.length) {
    return [];
  }

  const prompt = `
    Create ${count} multiple-choice quiz questions based on the following flashcards:
    
    ${flashcards.map(f => `Front: ${f.front}\nBack: ${f.back}`).join('\n\n')}
    
    For each question:
    - Create a clear question based on the content
    - Provide 4 options (including the correct answer)
    - Specify the index of the correct option (0-3)
    - Add a brief explanation of why the answer is correct
    
    Format your response as a valid JSON array of question objects, each containing "question", "options" (array of strings), "correctOptionIndex" (number 0-3), and "explanation" properties.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON part from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse quiz questions from AI response");
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions.slice(0, count);
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}

/**
 * Default recommendations to return if AI generation fails
 */
function defaultRecommendations(): AIRecommendation[] {
  return [
    {
      icon: "schedule",
      title: "Optimize Study Schedule",
      description: "Create a structured study schedule based on your productivity patterns.",
      type: "productivity"
    },
    {
      icon: "auto_stories",
      title: "Active Reading Technique",
      description: "Try the SQ3R method (Survey, Question, Read, Recite, Review) for better retention.",
      type: "productivity"
    },
    {
      icon: "groups",
      title: "Form Study Group",
      description: "Connect with classmates to review difficult concepts together.",
      type: "collaboration"
    },
    {
      icon: "school",
      title: "Practice Past Exams",
      description: "Find and complete previous year's exam questions to prepare effectively.",
      type: "subject"
    }
  ];
}