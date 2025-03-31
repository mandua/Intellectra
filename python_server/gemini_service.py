import os
import json
import re
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the Google Generative AI client
api_key = os.getenv("GEMINI_API_KEY", "dummy-key-for-development")
genai.configure(api_key=api_key)

# Default Gemini model - as specified by user
# Using gemini-2.0-flash as requested for optimal speed and quality
MODEL_NAME = "gemini-2.0-flash"

# Helper function to extract JSON from text responses
def extract_json_from_text(text: str) -> Any:
    try:
        # Try to find JSON-like content between curly braces
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        # If no JSON with curly braces, try to find arrays
        array_match = re.search(r'\[.*\]', text, re.DOTALL)
        if array_match:
            return json.loads(array_match.group(0))
        
        # If no parseable JSON found, throw error
        raise ValueError("No valid JSON found in response")
    except Exception as e:
        print("Error extracting JSON from text:", str(e))
        raise e

# Generate AI study recommendations
async def generate_study_recommendations(
    recent_topics: List[str],
    upcoming_exams: List[str],
    struggling_areas: List[str]
) -> List[Dict[str, str]]:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = f"""
        Based on the following information, provide 3 personalized study recommendations:
        
        Recent topics studied: {", ".join(recent_topics)}
        Upcoming exams: {", ".join(upcoming_exams)}
        Areas the student is struggling with: {", ".join(struggling_areas)}
        
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
        """

        response = model.generate_content(prompt)
        text = response.text
        
        parsed = extract_json_from_text(text)
        return parsed.get("recommendations", [])
    except Exception as e:
        print("Error generating study recommendations:", str(e))
        # Return fallback recommendations if Gemini call fails
        return [
            {
                "title": "Review Key Concepts",
                "description": "Focus on reviewing fundamentals you've recently studied",
                "type": "AI Suggested",
                "icon": "psychology"
            },
            {
                "title": "Try Timed Study Sessions",
                "description": "25/5 minute Pomodoro technique for better focus",
                "type": "Pomodoro",
                "icon": "schedule"
            },
            {
                "title": "Find Additional Resources",
                "description": "Supplement your learning with online materials",
                "type": "Resource",
                "icon": "auto_stories"
            }
        ]

# Generate AI flashcards from notes
async def generate_flashcards_from_notes(
    notes: str,
    subject: str,
    count: int = 5
) -> List[Dict[str, str]]:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = f"""
        Create {count} comprehensive, academic-level flashcards based on the following notes about {subject}:
        
        {notes}
        
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
        {{
          "flashcards": [
            {{
              "question": "What is the fundamental principle underlying photosynthesis and how does it serve as a critical biological energy conversion process?",
              "answer": "Photosynthesis represents one of nature's most elegant energy conversion mechanisms, wherein light energy is transformed into chemical energy through a sophisticated series of biochemical reactions. At its core, this process harnesses photons from sunlight to split water molecules, releasing oxygen as a byproduct, while simultaneously reducing carbon dioxide to form energy-rich carbohydrates. This fundamental principle establishes photosynthesis as the primary entry point for energy into most ecosystems, creating the foundation for nearly all food webs on Earth. The process occurs predominantly in chloroplasts containing specialized pigments like chlorophyll that absorb specific wavelengths of light, initiating electron transport chains that ultimately generate ATP and NADPH. These energy carriers subsequently power the Calvin cycle, where carbon dioxide is incorporated into organic molecules. Beyond its role in energy conversion, photosynthesis has profoundly influenced Earth's atmosphere through oxygen production, making it not only essential for plant metabolism but also indirectly responsible for supporting aerobic life forms across the planet."
            }}
          ]
        }}
        """

        response = model.generate_content(prompt)
        text = response.text
        
        parsed = extract_json_from_text(text)
        return parsed.get("flashcards", [])
    except Exception as e:
        print("Error generating flashcards:", str(e))
        # Return fallback flashcards if Gemini call fails
        return [
            {
                "question": f"What are the foundational principles and key dimensions of {subject}?",
                "answer": f"{subject} represents a multifaceted domain encompassing several interconnected theoretical frameworks and practical applications. At its fundamental level, it integrates core principles that have evolved through significant scholarly discourse and empirical investigation. The conceptual foundation typically includes hierarchical structures of knowledge that range from basic definitional elements to sophisticated analytical frameworks. Understanding these principles requires examining both historical development and contemporary interpretations across multiple disciplinary perspectives. The integration of these varied approaches provides a more nuanced comprehension than any single theoretical model could offer in isolation."
            },
            {
                "question": f"How has the understanding of {subject} evolved historically, and what are its contemporary applications?",
                "answer": f"The historical trajectory of {subject} reflects a progressive refinement of ideas through several key intellectual periods. Early formulations often emerged from foundational work by pioneering scholars who established initial theoretical frameworks. Throughout subsequent decades, these conceptualizations underwent significant transformations as new methodological approaches and analytical techniques emerged. Contemporary applications span diverse domains including educational contexts, research methodologies, professional practices, and technological innovations. In each sphere, theoretical principles are translated into practical implementations that address specific challenges while maintaining conceptual integrity. This evolution demonstrates both continuity in core principles and adaptation to changing contextual requirements."
            },
            {
                "question": f"What methodological approaches are employed in the study of {subject}, and what are their relative strengths?",
                "answer": f"The methodological landscape for studying {subject} encompasses diverse approaches, each offering distinct advantages for understanding different facets of the domain. Quantitative methodologies provide statistical rigor and empirical validation through measurement and analysis of observable phenomena. Qualitative approaches offer depth through interpretive frameworks that explore contextual nuances and subjective dimensions. Mixed methods integrate these complementary perspectives to develop more comprehensive understanding. Theoretical analysis examines conceptual foundations and logical structures underpinning the subject, while applied research focuses on practical implementation and real-world outcomes. The selection of methodological approach depends on specific research questions, available resources, and the nature of the phenomena being investigated."
            }
        ]

# Generate AI enhanced notes
async def enhance_notes(
    notes: str,
    subject: str
) -> Dict[str, Any]:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = f"""
        Enhance the following student notes on {subject}:
        
        {notes}
        
        Please provide:
        1. An enhanced, structured version of the notes that:
           - Improves organization with clear headings and subheadings
           - Expands abbreviated concepts with complete explanations
           - Adds missing context or connections between topics
           - Fills in any apparent gaps or incomplete information
           - Corrects any factual inaccuracies or misconceptions
        
        2. A summary of 3-5 key concepts covered in these notes
        
        3. A list of 3-5 additional resources (books, articles, websites) for further study
        
        Format your response as a JSON object with enhancedNotes, keyConcepts, and additionalResources fields.
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        return extract_json_from_text(text)
    except Exception as e:
        print("Error enhancing notes:", str(e))
        # Return fallback enhanced notes
        return {
            "enhancedNotes": f"# Enhanced Notes on {subject}\n\n" + notes,
            "keyConcepts": [
                f"The foundational principles of {subject}",
                f"The organizational structure of {subject}",
                f"Applications and practical implications of {subject}"
            ],
            "additionalResources": [
                {
                    "title": f"Introduction to {subject}",
                    "type": "Book",
                    "description": f"A comprehensive introduction to the field of {subject}"
                },
                {
                    "title": f"{subject} - Online Tutorial",
                    "type": "Website",
                    "description": f"Interactive learning materials for {subject}"
                },
                {
                    "title": f"Recent Advances in {subject}",
                    "type": "Journal Article",
                    "description": f"Overview of current research in {subject}"
                }
            ]
        }

# Generate AI concept map
async def generate_concept_map(
    topic: str,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        note_context = f"""
        Based on the following notes provided by the user:
        
        {notes}
        
        """ if notes else ""
        
        prompt = f"""
        {note_context}Create a concept map for the topic "{topic}". 
        
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
        
        {{
          "nodes": [
            {{
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
            }},
            {{
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
            }}
          ],
          "edges": [
            {{
              "source": "1",
              "target": "2"
            }}
          ]
        }}
        
        Do not include any positional information like x or y coordinates. Ensure each node has a unique ID and that edges correctly define the hierarchical relationships between concepts.
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        parsed = extract_json_from_text(text)
        
        # Add random spacing for visualization
        # This helps position nodes in a more readable way
        import random
        import math
        
        nodes = parsed.get("nodes", [])
        
        # Add position data for visualization
        for i, node in enumerate(nodes):
            if i == 0:  # Main concept in the center
                node["x"] = 250
                node["y"] = 250
            else:
                # Position in a circular pattern around the main node
                angle = 2 * math.pi * i / (len(nodes) - 1) if len(nodes) > 1 else 0
                distance = 200
                node["x"] = 250 + distance * math.cos(angle)
                node["y"] = 250 + distance * math.sin(angle)
        
        return {
            "nodes": nodes,
            "edges": parsed.get("edges", [])
        }
    except Exception as e:
        print("Error generating concept map:", str(e))
        # Return fallback concept map
        main_id = "1"
        nodes = [
            {
                "id": main_id,
                "label": topic,
                "description": f"{topic} encompasses multiple interconnected concepts and principles that form a cohesive framework for understanding this domain.",
                "bulletPoints": [
                    f"Core principles of {topic} serve as the foundation for all specialized applications",
                    f"Understanding {topic} requires examining both theoretical models and practical implementations",
                    f"The field of {topic} continues to evolve through ongoing research and new discoveries"
                ],
                "x": 250,
                "y": 250
            }
        ]
        
        edges = []
        
        # Generate some sub-concepts
        sub_concepts = [
            f"Fundamentals of {topic}",
            f"Applications of {topic}",
            f"Historical Development",
            f"Current Research"
        ]
        
        for i, concept in enumerate(sub_concepts):
            node_id = str(i + 2)
            
            # Position in a circular pattern around the main node
            angle = 2 * math.pi * i / len(sub_concepts)
            distance = 200
            x = 250 + distance * math.cos(angle)
            y = 250 + distance * math.sin(angle)
            
            nodes.append({
                "id": node_id,
                "label": concept,
                "description": f"This aspect of {topic} focuses on specific elements that contribute to the broader understanding of the subject.",
                "bulletPoints": [
                    f"Key component of understanding {topic}",
                    f"Builds upon fundamental principles while extending into specialized areas",
                    f"Provides context for practical applications and theoretical development"
                ],
                "x": x,
                "y": y
            })
            
            edges.append({
                "source": main_id,
                "target": node_id
            })
        
        return {
            "nodes": nodes,
            "edges": edges
        }