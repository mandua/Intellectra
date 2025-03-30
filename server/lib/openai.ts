import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_development" });

export interface AIRecommendation {
  icon: string;
  title: string;
  description: string;
  type: "productivity" | "subject" | "collaboration";
}

export async function generateStudyRecommendations(
  userId: number, 
  productivityData: any,
  subjects: string[]
): Promise<AIRecommendation[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI study assistant that provides personalized study recommendations based on a student's productivity data and subjects."
        },
        {
          role: "user",
          content: `Generate 3 study recommendations for a student based on the following data:
          Subjects: ${subjects.join(', ')}
          Productivity data: ${JSON.stringify(productivityData)}
          
          Format each recommendation as a JSON object with:
          - icon: one of these material icons: "psychology", "lightbulb", "tips_and_updates"
          - title: a short, actionable recommendation title
          - description: a brief explanation of the recommendation (max 100 chars)
          - type: one of "productivity", "subject", or "collaboration"
          
          Return an array of 3 recommendation objects.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return [
      {
        icon: "psychology",
        title: "Study during peak productivity hours",
        description: "Schedule your most challenging topics during your most productive hours of the day.",
        type: "productivity"
      },
      {
        icon: "lightbulb",
        title: `Review ${subjects[0] || 'your subject'} concepts`,
        description: "Focus on the fundamentals to strengthen your understanding of key concepts.",
        type: "subject"
      },
      {
        icon: "tips_and_updates",
        title: "Create a study group",
        description: "Collaborating with peers can boost your understanding and motivation.",
        type: "collaboration"
      }
    ];
  }
}

export async function generateFlashcardsFromNotes(noteContent: string, subject: string, count: number = 5): Promise<{front: string, back: string}[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI study assistant that creates effective flashcards from student notes."
        },
        {
          role: "user",
          content: `Create ${count} flashcards from the following notes about ${subject}:
          
          ${noteContent}
          
          Format the response as a JSON array of objects, each with:
          - front: the question or prompt (concise, clear)
          - back: the answer or explanation (comprehensive but brief)
          
          Make sure the flashcards cover key concepts and test understanding, not just memorization.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
}

export async function enhanceNotes(noteContent: string): Promise<{enhancedContent: string, keyPoints: string[]}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI study assistant that helps enhance student notes by organizing content and identifying key concepts."
        },
        {
          role: "user",
          content: `Enhance the following study notes:
          
          ${noteContent}
          
          Format the response as a JSON object with:
          - enhancedContent: the original content with improved organization, clarity and formatting
          - keyPoints: an array of 3-5 key points or concepts from the notes
          
          Don't add new factual content, just improve the organization and highlight important concepts.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      enhancedContent: result.enhancedContent || noteContent,
      keyPoints: result.keyPoints || []
    };
  } catch (error) {
    console.error("Error enhancing notes:", error);
    return {
      enhancedContent: noteContent,
      keyPoints: []
    };
  }
}

export async function generateQuizQuestions(deckId: number, flashcards: Flashcard[], count: number = 5): Promise<any[]> {
  try {
    let content = "Generate quiz questions based on these flashcards:\n\n";
    flashcards.forEach((card, i) => {
      content += `Card ${i+1}:\nQuestion: ${card.front}\nAnswer: ${card.back}\n\n`;
    });
    
    content += `Create ${count} multiple-choice quiz questions that test understanding of these concepts.
    Format as a JSON array of objects, each with:
    - question: the question text
    - options: array of 4 possible answers
    - correctOptionIndex: index of the correct answer (0-3)
    - explanation: brief explanation of why the answer is correct`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI study assistant that creates quiz questions from flashcards."
        },
        {
          role: "user",
          content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.quizQuestions || [];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}

export default {
  generateStudyRecommendations,
  generateFlashcardsFromNotes,
  enhanceNotes,
  generateQuizQuestions
};
