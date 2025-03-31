import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key-for-development");

// Default Gemini model - as specified by user
// Using gemini-2.0-flash as requested for optimal speed and quality
const MODEL_NAME = "gemini-2.0-flash";

// Helper function to extract JSON from text responses
function extractJsonFromText(text: string): any {
  try {
    // Try to find JSON-like content between curly braces
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON with curly braces, try to find arrays
    const arrayMatch = text.match(/\[.*\]/s);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    
    // If no parseable JSON found, throw error
    throw new Error("No valid JSON found in response");
  } catch (error) {
    console.error("Error extracting JSON from text:", error);
    throw error;
  }
}

// Generate AI study recommendations
export async function generateStudyRecommendations(
  recentTopics: string[],
  upcomingExams: string[],
  strugglingAreas: string[]
): Promise<Array<{ title: string; description: string; type: string; icon: string }>> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

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
      
      Format your response as a valid JSON object with a "recommendations" array containing objects with fields: title, description, type, and icon.
      
      Example:
      {
        "recommendations": [
          {
            "title": "Practice Calculus Problems",
            "description": "Focus on derivatives and integrals",
            "type": "AI Suggested",
            "icon": "psychology"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJsonFromText(text);
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Error generating study recommendations:", error);
    // Return fallback recommendations if Gemini call fails
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
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const prompt = `
      Create ${count} flashcards based on the following notes about ${subject}:
      
      ${notes}
      
      For each flashcard, create:
      1. A clear, concise question
      2. A comprehensive but concise answer
      
      Format your response as a valid JSON object with a "flashcards" array containing objects with question and answer fields.
      
      Example:
      {
        "flashcards": [
          {
            "question": "What is photosynthesis?",
            "answer": "The process by which plants convert light energy into chemical energy"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJsonFromText(text);
    return parsed.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    // Return fallback flashcards if Gemini call fails
    return [
      {
        question: "What are the key concepts in this topic?",
        answer: "The key concepts could not be automatically generated. Please try again later."
      }
    ];
  }
}

// Generate AI concept map
export async function generateConceptMap(
  topic: string,
  notes?: string
): Promise<{
  nodes: Array<{
    id: string;
    label: string;
    description: string;
    x?: number;
    y?: number;
  }>,
  edges: Array<{
    source: string;
    target: string;
  }>
}> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const noteContext = notes ? 
      `Based on the following notes provided by the user:
      
      ${notes}
      
      ` : '';

    const prompt = `
      ${noteContext}Create a concept map for the topic "${topic}". 
      
      A concept map should include:
      1. Main concept (the topic itself at the top level)
      2. Key sub-concepts (5-8 important components or aspects) branching from the main concept
      3. Further sub-concepts (2-3 for each key concept) where appropriate
      4. Clear hierarchical relationships between concepts
      5. Brief but informative descriptions for each concept
      
      Format your response as a valid JSON object with:
      1. "nodes": Array of objects, each with:
         - "id": Unique string identifier (numbers only)
         - "label": Short name of the concept (1-4 words)
         - "description": Brief but comprehensive explanation of the concept (2-3 sentences)
         - "bulletPoints": Array of 3-4 key points about this concept
      
      2. "edges": Array of objects, each with:
         - "source": The id of the source node
         - "target": The id of the target node
      
      For example, for topic "Photosynthesis":
      
      {
        "nodes": [
          {
            "id": "1",
            "label": "Photosynthesis",
            "description": "The process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. Generates oxygen as a byproduct.",
            "bulletPoints": ["Converts light energy to chemical energy", "Occurs in chloroplasts", "Essential for most life on Earth", "Formula: 6CO2 + 6H2O → C6H12O6 + 6O2"]
          },
          {
            "id": "2",
            "label": "Light Reactions",
            "description": "The first stage of photosynthesis where light energy is captured and converted to chemical energy. Takes place in thylakoid membranes of chloroplasts.",
            "bulletPoints": ["Requires direct light", "Produces ATP and NADPH", "Releases oxygen as byproduct", "Involves photosystems I and II"]
          }
        ],
        "edges": [
          {
            "source": "1",
            "target": "2"
          }
        ]
      }
      
      Do not include any positional information like x or y coordinates. Ensure each node has a unique ID and that edges correctly define the hierarchical relationships between concepts.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJsonFromText(text);
    
    // Add random spacing for visualization
    // This helps position nodes in a more readable way
    const nodes = parsed.nodes.map((node: any, index: number) => ({
      ...node,
      x: index === 0 ? 250 : 100 + Math.random() * 400, // Center first node (main topic)
      y: index === 0 ? 50 : 100 + Math.random() * 300  
    }));
    
    return { 
      nodes,
      edges: parsed.edges || []
    };
  } catch (error) {
    console.error("Error generating concept map:", error);
    // Return basic concept map if Gemini call fails
    const nodes = [
      { 
        id: '1', 
        label: topic, 
        description: 'Main concept and foundational principles.', 
        bulletPoints: ['Core principles', 'Fundamental aspects', 'Basic definitions', 'Key terminology'],
        x: 250, 
        y: 50 
      },
      { 
        id: '2', 
        label: `Definition of ${topic}`, 
        description: `Understanding what ${topic} means and its core principles.`, 
        bulletPoints: ['Origin and history', 'Conceptual framework', 'Critical characteristics'],
        x: 100, 
        y: 150 
      },
      { 
        id: '3', 
        label: `Applications of ${topic}`, 
        description: `How ${topic} is used in real-world scenarios.`, 
        bulletPoints: ['Practical implementations', 'Real-world examples', 'Case studies', 'Industry relevance'],
        x: 400, 
        y: 150 
      }
    ];
    
    const edges = [
      { source: '1', target: '2' },
      { source: '1', target: '3' }
    ];
    
    return { nodes, edges };
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
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const prompt = `
      Enhance the following study notes about ${subject} by:
      1. Adding clarifications where needed
      2. Identifying and listing 3-5 key concepts
      
      Original notes:
      ${notes}
      
      Format your response as a valid JSON object with:
      1. enhancedNotes: The improved version of the notes
      2. keyConcepts: An array of strings with the key concepts
      
      Example:
      {
        "enhancedNotes": "The enhanced notes go here...",
        "keyConcepts": ["Key concept 1", "Key concept 2", "Key concept 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJsonFromText(text);
    return {
      enhancedNotes: parsed.enhancedNotes || notes,
      keyConcepts: parsed.keyConcepts || ["Unable to identify key concepts automatically"]
    };
  } catch (error) {
    console.error("Error enhancing notes:", error);
    // Return original notes if Gemini call fails
    return { 
      enhancedNotes: notes,
      keyConcepts: ["Unable to identify key concepts automatically"]
    };
  }
}