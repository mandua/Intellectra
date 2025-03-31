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
      Create ${count} comprehensive, academic-level flashcards based on the following notes about ${subject}:
      
      ${notes}
      
      For each flashcard:
      1. Create a specific, thought-provoking question that tests deep understanding of a particular aspect of the subject
      2. Provide a detailed, comprehensive answer (150-200 words) that:
         - Thoroughly explains the concept with academic precision
         - Includes relevant examples, applications, or case studies when appropriate
         - Mentions connections to related concepts
         - Addresses common misconceptions or nuances
         - Uses proper terminology and scholarly language
      
      Each flashcard should focus on a different aspect of the topic, covering where appropriate:
      - Foundational principles and definitions
      - Historical context or development
      - Key components, mechanisms, or methodologies
      - Practical applications or real-world relevance
      - Theoretical frameworks
      - Contemporary research or emerging directions
      - Critical analysis or limitations
      
      Format your response as a valid JSON object with a "flashcards" array containing objects with question and answer fields.
      
      Example:
      {
        "flashcards": [
          {
            "question": "What is the fundamental principle underlying photosynthesis and how does it serve as a critical biological energy conversion process?",
            "answer": "Photosynthesis represents one of nature's most elegant energy conversion mechanisms, wherein light energy is transformed into chemical energy through a sophisticated series of biochemical reactions. At its core, this process harnesses photons from sunlight to split water molecules, releasing oxygen as a byproduct, while simultaneously reducing carbon dioxide to form energy-rich carbohydrates. This fundamental principle establishes photosynthesis as the primary entry point for energy into most ecosystems, creating the foundation for nearly all food webs on Earth. The process occurs predominantly in chloroplasts containing specialized pigments like chlorophyll that absorb specific wavelengths of light, initiating electron transport chains that ultimately generate ATP and NADPH. These energy carriers subsequently power the Calvin cycle, where carbon dioxide is incorporated into organic molecules. Beyond its role in energy conversion, photosynthesis has profoundly influenced Earth's atmosphere through oxygen production, making it not only essential for plant metabolism but also indirectly responsible for supporting aerobic life forms across the planet."
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
        question: `What are the foundational principles and key dimensions of ${subject}?`,
        answer: `${subject} represents a multifaceted domain encompassing several interconnected theoretical frameworks and practical applications. At its fundamental level, it integrates core principles that have evolved through significant scholarly discourse and empirical investigation. The conceptual foundation typically includes hierarchical structures of knowledge that range from basic definitional elements to sophisticated analytical frameworks. Understanding these principles requires examining both historical development and contemporary interpretations across multiple disciplinary perspectives. The integration of these varied approaches provides a more nuanced comprehension than any single theoretical model could offer in isolation.`
      },
      {
        question: `How has the understanding of ${subject} evolved historically, and what are its contemporary applications?`,
        answer: `The historical trajectory of ${subject} reflects a progressive refinement of ideas through several key intellectual periods. Early formulations often emerged from foundational work by pioneering scholars who established initial theoretical frameworks. Throughout subsequent decades, these conceptualizations underwent significant transformations as new methodological approaches and analytical techniques emerged. Contemporary applications span diverse domains including educational contexts, research methodologies, professional practices, and technological innovations. In each sphere, theoretical principles are translated into practical implementations that address specific challenges while maintaining conceptual integrity. This evolution demonstrates both continuity in core principles and adaptation to changing contextual requirements.`
      },
      {
        question: `What methodological approaches are employed in the study of ${subject}, and what are their relative strengths?`,
        answer: `The methodological landscape for studying ${subject} encompasses diverse approaches, each offering distinct advantages for understanding different facets of the domain. Quantitative methodologies provide statistical rigor and empirical validation through measurement and analysis of observable phenomena. Qualitative approaches offer depth through interpretive frameworks that explore contextual nuances and subjective dimensions. Mixed methods integrate these complementary perspectives to develop more comprehensive understanding. Theoretical analysis examines conceptual foundations and logical structures underpinning the subject, while applied research focuses on practical implementation and real-world outcomes. The selection of methodological approach depends on specific research questions, available resources, and the nature of the phenomena being investigated.`
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
            "description": "The sophisticated biochemical process by which green plants, algae, and certain bacteria harness solar energy to convert carbon dioxide and water into organic compounds (primarily glucose) and release oxygen as a byproduct. This fundamental process is the primary means by which energy from sunlight enters the biosphere and serves as the foundation for most food chains on Earth.",
            "bulletPoints": [
              "Converts light energy into chemical energy stored in glucose molecules through a complex series of electron transfers and enzymatic reactions",
              "Takes place in specialized organelles called chloroplasts which contain thylakoid membranes where light-dependent reactions occur and stroma where carbon fixation happens",
              "Essential for most life on Earth as it produces oxygen, removes carbon dioxide, and provides the base of nearly all food webs through primary production",
              "Occurs in two main stages: the light-dependent reactions (photosystems I and II) and the light-independent reactions (Calvin cycle)",
              "The complete biochemical equation can be represented as: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂"
            ]
          },
          {
            "id": "2",
            "label": "Light-Dependent Reactions",
            "description": "The initial stage of photosynthesis where electromagnetic radiation from the sun is captured by photosynthetic pigments (primarily chlorophyll) and converted into chemical energy in the form of ATP and NADPH. These reactions occur exclusively in the thylakoid membrane system of chloroplasts and are responsible for the production of oxygen as a byproduct through the photolysis of water molecules.",
            "bulletPoints": [
              "Requires direct light energy, specifically wavelengths within the visible spectrum that are absorbed by specialized pigment molecules arranged in light-harvesting complexes",
              "Produces energy carriers ATP (adenosine triphosphate) through photophosphorylation and reduces NADP+ to NADPH, both of which are subsequently used in the Calvin cycle",
              "Releases molecular oxygen (O₂) as a byproduct through the splitting of water molecules in a process called photolysis, which has dramatically altered Earth's atmosphere over evolutionary time",
              "Involves two specialized protein complexes called photosystems I and II which contain different types of chlorophyll molecules and function in series through the Z-scheme of electron transport",
              "Utilizes both cyclic and non-cyclic electron flow pathways to meet varying cellular energy requirements and maintain appropriate ratios of ATP to NADPH for downstream metabolic processes"
            ]
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
        description: `A comprehensive exploration of ${topic} including its historical development, theoretical foundations, modern applications, and ongoing research. This core concept serves as the central framework for understanding related subtopics and encompasses multiple dimensions of both theoretical and practical knowledge.`, 
        bulletPoints: [
          'Fundamental theoretical principles that form the basis of understanding this field of study with historical context and evolution of thought',
          'Essential terminologies, definitions, and conceptual frameworks necessary for deep comprehension of the subject matter',
          'Relationship to broader academic disciplines and how this concept integrates within the larger body of knowledge',
          'Current scholarly debates and differing schools of thought regarding interpretation and significance',
          'Methodological approaches used to study and advance knowledge in this area'
        ],
        x: 250, 
        y: 50 
      },
      { 
        id: '2', 
        label: `Definition of ${topic}`, 
        description: `An in-depth examination of how ${topic} is formally defined across different contexts, disciplines, and historical periods. This comprehensive definition encompasses etymological origins, semantic evolution, and contemporary scholarly interpretations to provide a nuanced understanding of the concept's scope and boundaries.`, 
        bulletPoints: [
          'Historical evolution of the definition from its earliest documented usage to modern interpretations with key historical figures who shaped the concept',
          'Cross-disciplinary variations in how the term is defined and understood across different academic and practical fields',
          'Formal taxonomic classification and relationship to similar or adjacent concepts within the knowledge hierarchy',
          'Distinguishing characteristics that differentiate this concept from related ideas or potential misconceptions',
          'Contemporary scholarly consensus and areas where definitions remain contested or are evolving'
        ],
        x: 100, 
        y: 150 
      },
      { 
        id: '3', 
        label: `Applications of ${topic}`, 
        description: `A detailed analysis of how ${topic} manifests in practical implementations across various domains including industry, research, education, and everyday contexts. This exploration covers both established applications with proven track records and emerging uses that represent cutting-edge developments in the field.`, 
        bulletPoints: [
          'Industry-specific implementations showcasing how the concept translates to professional practice across different sectors',
          'Case studies of successful applications with detailed analysis of methodologies, challenges faced, and outcomes achieved',
          'Technological innovations and tools that have emerged from or been influenced by this concept',
          'Interdisciplinary applications demonstrating how the concept bridges different fields and creates new approaches to complex problems',
          'Future directions and emerging applications currently being developed or researched'
        ],
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