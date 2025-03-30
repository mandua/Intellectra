import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development" });

// Generate AI study recommendations
export async function generateStudyRecommendations(
  recentTopics: string[],
  upcomingExams: string[],
  strugglingAreas: string[]
): Promise<Array<{ title: string; description: string; type: string; icon: string }>> {
  try {
    const prompt = `
      Based on the following information, provide 3 personalized study recommendations:
      
      Recent topics studied: ${recentTopics.join(", ")}
      Upcoming exams: ${upcomingExams.join(", ")}
      Areas the student is struggling with: ${strugglingAreas.join(", ")}
      
      For each recommendation, provide:
      1. A short title (max 5 words)
      2. A brief description explaining the recommendation (max 15 words)
      3. A type ("AI Suggested", "Pomodoro", "Resource", "Quiz", or "Review")
      4. An icon name from Material Icons (use one of: psychology, schedule, auto_stories, quiz, summarize)
      
      Format your response as a JSON array with objects with fields: title, description, type, and icon.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI study assistant helping students optimize their learning." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Error generating study recommendations:", error);
    // Return fallback recommendations if OpenAI call fails
    return [
      {
        title: "Review Key Concepts",
        description: "Focus on reviewing fundamentals you've recently studied",
        type: "AI Suggested",
        icon: "psychology"
      },
      {
        title: "Try Timed Study Sessions",
        description: "25/5 minute Pomodoro technique for better focus",
        type: "Pomodoro",
        icon: "schedule"
      },
      {
        title: "Find Additional Resources",
        description: "Supplement your learning with online materials",
        type: "Resource",
        icon: "auto_stories"
      }
    ];
  }
}

// Generate AI flashcards from notes
export async function generateFlashcardsFromNotes(
  notes: string,
  subject: string,
  count: number = 5
): Promise<Array<{ question: string; answer: string }>> {
  try {
    const prompt = `
      Create ${count} flashcards based on the following notes about ${subject}:
      
      ${notes}
      
      For each flashcard, create:
      1. A clear, concise question
      2. A comprehensive but concise answer
      
      Format your response as a JSON array with objects containing question and answer fields.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI study assistant helping students create effective flashcards." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsed = JSON.parse(content);
    return parsed.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    // Return fallback flashcards if OpenAI call fails
    return [
      {
        question: "What are the key concepts in this topic?",
        answer: "The key concepts could not be automatically generated. Please try again later."
      }
    ];
  }
}

// Enhance notes with AI suggestions
export async function enhanceNotes(
  notes: string,
  subject: string
): Promise<{ 
  enhancedNotes: string; 
  keyConcepts: string[];
}> {
  try {
    const prompt = `
      Enhance the following study notes about ${subject} by:
      1. Adding clarifications where needed
      2. Identifying and listing 3-5 key concepts
      
      Original notes:
      ${notes}
      
      Format your response as a JSON object with:
      1. enhancedNotes: The improved version of the notes
      2. keyConcepts: An array of strings with the key concepts
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI study assistant helping students improve their notes." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error enhancing notes:", error);
    // Return original notes if OpenAI call fails
    return { 
      enhancedNotes: notes,
      keyConcepts: ["Unable to identify key concepts automatically"]
    };
  }
}
