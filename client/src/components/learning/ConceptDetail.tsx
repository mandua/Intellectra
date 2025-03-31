import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { BookOpen, Video, Brain, BookOpenCheck, Edit, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import FlashCardSet from './FlashCardSet';

interface ConceptDetailProps {
  conceptId: string;
  conceptData: {
    label: string;
    description: string;
    bulletPoints?: string[];
    [key: string]: any;
  };
  onClose: () => void;
  onUpdate?: (conceptId: string, updatedData: any) => void;
}

export default function ConceptDetail({ conceptId, conceptData, onClose, onUpdate }: ConceptDetailProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('explanation');
  const [videoLoading, setVideoLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    label: conceptData.label,
    description: conceptData.description,
    bulletPoints: conceptData.bulletPoints || []
  });
  
  // Handle editing changes
  const handleEditChange = (field: string, value: string) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };
  
  // Handle editing bullet point changes
  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...editData.bulletPoints];
    newBullets[index] = value;
    setEditData({
      ...editData,
      bulletPoints: newBullets
    });
  };
  
  // Add new bullet point
  const addBulletPoint = () => {
    setEditData({
      ...editData,
      bulletPoints: [...editData.bulletPoints, ""]
    });
  };
  
  // Remove bullet point
  const removeBulletPoint = (index: number) => {
    const newBullets = [...editData.bulletPoints];
    newBullets.splice(index, 1);
    setEditData({
      ...editData,
      bulletPoints: newBullets
    });
  };
  
  // Save changes
  const saveChanges = () => {
    if (onUpdate) {
      onUpdate(conceptId, editData);
    }
    setIsEditing(false);
  };

  // Mock videos that would come from YouTube API
  const mockVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  
  // Generate a detailed explanation based on concept data
  const generateDetailedExplanation = () => {
    const label = conceptData.label;
    const description = conceptData.description || `A comprehensive exploration of ${label}.`;
    const bulletPoints = conceptData.bulletPoints || [
      'Key theoretical foundations and principles',
      'Historical development and context',
      'Major applications and implementations',
      'Contemporary research and future directions'
    ];
    
    // Create a more academic sounding explanation with the concept data
    return `
      <h3 class="text-lg font-semibold mb-3">${label}</h3>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Comprehensive Overview</h4>
        <p class="mb-3">${description}</p>
        
        <p class="mb-3">
          The study of ${label} represents a significant area within its broader academic discipline, 
          incorporating elements from multiple theoretical frameworks and methodological approaches. 
          Scholars examining this concept must consider its multifaceted nature, historical evolution, 
          and the various contexts in which it manifests both theoretically and in practical applications.
        </p>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Historical Context</h4>
        <p class="mb-3">
          The historical development of ${label} can be traced through several key periods of intellectual 
          advancement. Early formulations emerged from foundational work by pioneering thinkers who sought to 
          systematize observations and establish theoretical frameworks. Throughout subsequent decades, this 
          concept underwent significant refinement as new research methodologies and technological capabilities 
          allowed for more sophisticated analysis and application.
        </p>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Theoretical Framework</h4>
        <p class="mb-3">
          Contemporary understanding of ${label} is informed by multiple theoretical perspectives. These diverse 
          approaches offer complementary frameworks for analyzing the fundamental principles, mechanisms, 
          and implications. The integration of these various theoretical models provides a more comprehensive 
          understanding than any single perspective could offer in isolation.
        </p>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Key Components and Principles</h4>
        <ul class="list-disc pl-5 mb-3 space-y-2">
          ${bulletPoints.map(point => `<li class="text-base">${point}</li>`).join('')}
        </ul>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Applications and Implications</h4>
        <p class="mb-3">
          The practical applications of ${label} extend across numerous domains. In educational contexts, 
          it provides frameworks for curriculum development and pedagogical approaches. In research settings, 
          it informs experimental design and interpretative frameworks. In professional practice, it guides 
          decision-making processes and implementation strategies for addressing complex challenges.
        </p>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Current Research Frontiers</h4>
        <p class="mb-3">
          Contemporary research on ${label} continues to expand in several directions. Emerging areas of inquiry include 
          interdisciplinary approaches that integrate insights from adjacent fields, applications of advanced 
          technologies that enable new forms of analysis, and critical reevaluations that challenge longstanding 
          assumptions and open new avenues for theoretical development.
        </p>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Common Misconceptions</h4>
        <p class="mb-3">
          Several misconceptions about ${label} persist in both popular understanding and sometimes within academic contexts:
        </p>
        <ul class="list-disc pl-5 mb-3">
          <li>Oversimplification that reduces complex phenomena to single causal factors</li>
          <li>Overgeneralization from specific cases to broader contexts without sufficient consideration of contextual variables</li>
          <li>Misapplication of theoretical principles without attention to boundary conditions and limitations</li>
          <li>Failure to recognize the evolutionary nature of the concept and its ongoing theoretical development</li>
        </ul>
      </div>
      
      <div class="mb-4">
        <h4 class="text-md font-semibold mb-2">Interdisciplinary Connections</h4>
        <p class="mb-3">
          ${label} maintains important connections with several adjacent fields and concepts. These interconnections 
          create a rich network of related ideas that mutually inform one another and provide multiple perspectives 
          for comprehending complex phenomena. Understanding these relationships enhances appreciation for how 
          this concept functions within broader intellectual frameworks.
        </p>
      </div>
      
      <p class="text-sm text-gray-500 mt-4">
        This detailed explanation was generated by AI to provide a comprehensive overview of ${label}. 
        For more specific information, please consult academic sources dedicated to this subject.
      </p>
    `;
  };

  // Generate the explanation using the concept data
  const mockExplanation = generateDetailedExplanation();
  
  // State for flashcards
  const [flashcards, setFlashcards] = useState([
    { id: '1', question: 'What is the main purpose of this concept?', answer: 'To understand the fundamental principles that govern the subject area.' },
    { id: '2', question: 'How does this concept relate to the broader topic?', answer: 'It serves as a foundational element that supports more complex ideas within the field.' },
    { id: '3', question: 'What are common applications of this concept?', answer: 'This concept is applied in various scenarios including examples related to the field.' }
  ]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  
  // Generate AI flashcards
  const generateAIFlashcards = async (showToast = true) => {
    setIsGeneratingFlashcards(true);
    
    try {
      const response = await fetch('/api/concept-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concept: conceptData.label,
          description: conceptData.description,
          bulletPoints: conceptData.bulletPoints
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }
      
      const data = await response.json();
      
      // Transform the data into our flashcard format
      const newFlashcards = data.map((card: any, index: number) => ({
        id: `ai-card-${index}`,
        question: card.question || card.front,
        answer: card.answer || card.back
      }));
      
      if (newFlashcards && newFlashcards.length > 0) {
        setFlashcards(newFlashcards);
        if (showToast) {
          toast({
            title: 'Flashcards Generated',
            description: `${newFlashcards.length} AI-generated flashcards are ready for studying.`
          });
        }
      } else {
        throw new Error('No flashcards were generated');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to generate AI flashcards. Using default cards instead.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };
  
  // Auto-generate flashcards when the component mounts
  useEffect(() => {
    // Generate AI flashcards without showing toasts
    generateAIFlashcards(false);
    
    // Note: Dependencies should include conceptData to regenerate when concept changes
    // But not flashcards or toast to avoid infinite loops
  }, [conceptData.label, conceptData.description]);
  
  // Update a flashcard
  const handleFlashcardUpdate = (cardId: string, question: string, answer: string) => {
    setFlashcards(prev => prev.map(card => 
      card.id === cardId ? { ...card, question, answer } : card
    ));
    
    toast({
      title: 'Flashcard Updated',
      description: 'Your changes have been saved.'
    });
  };
  
  // Add a new flashcard
  const handleAddFlashcard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      question: 'New question',
      answer: 'New answer'
    };
    
    setFlashcards(prev => [...prev, newCard]);
    
    toast({
      title: 'Flashcard Added',
      description: 'A new flashcard has been added to the set.'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        {isEditing ? (
          <>
            <CardTitle className="flex items-center justify-between">
              <Input 
                value={editData.label} 
                onChange={(e) => handleEditChange('label', e.target.value)}
                className="font-bold text-lg"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={saveChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </CardTitle>
            <div className="mt-2">
              <Label>Description</Label>
              <Textarea 
                value={editData.description} 
                onChange={(e) => handleEditChange('description', e.target.value)}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Key Points</Label>
                <Button variant="outline" size="sm" onClick={addBulletPoint}>Add Point</Button>
              </div>
              {editData.bulletPoints.map((point, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input 
                    value={point} 
                    onChange={(e) => handleBulletChange(index, e.target.value)}
                    placeholder={`Bullet point ${index + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeBulletPoint(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <CardTitle className="flex items-center justify-between">
              <span>{conceptData.label}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
              </div>
            </CardTitle>
            <CardDescription>{conceptData.description}</CardDescription>

            {conceptData.bulletPoints && conceptData.bulletPoints.length > 0 && (
              <div className="mt-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h4 className="text-sm font-medium mb-2">Key Points:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {conceptData.bulletPoints.map((point, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300">{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardHeader>
      
      {!isEditing && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="explanation" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Explanation</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Video</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>Flashcards</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="explanation" className="min-h-[400px]">
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mockExplanation }} />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="video" className="min-h-[400px]">
              <div className="aspect-video relative">
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Spinner size="lg" />
                  </div>
                )}
                <iframe
                  width="100%"
                  height="100%"
                  src={mockVideoUrl}
                  title={`Video about ${conceptData.label}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setVideoLoading(false)}
                  className="absolute inset-0"
                ></iframe>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Video Summary</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This video explains the key aspects of {conceptData.label}, including its definition, 
                  applications, and relationship to other concepts in the field.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="flashcards" className="min-h-[400px]">
              <ScrollArea className="h-[400px]">
                <div className="pb-4">
                  <div className="flex justify-end mb-4">
                    <Button 
                      onClick={() => generateAIFlashcards(true)} 
                      disabled={isGeneratingFlashcards}
                      className="flex items-center gap-2"
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Spinner size="sm" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4" />
                          <span>Generate AI Flashcards</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <FlashCardSet 
                    title={`${conceptData.label} Flashcards`}
                    description="Test your understanding of this concept with these interactive flashcards"
                    cards={flashcards}
                    onCardUpdate={handleFlashcardUpdate}
                    onAddCard={handleAddFlashcard}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
      
      {!isEditing && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Back to Concept Map</Button>
          <Button>
            <BookOpenCheck className="h-4 w-4 mr-2" />
            Mark as Understood
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}