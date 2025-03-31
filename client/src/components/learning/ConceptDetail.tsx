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
import FlashcardEditor from './FlashcardEditor';

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
  const [activeTab, setActiveTab] = useState('explanation');
  const [videoLoading, setVideoLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    label: conceptData.label,
    description: conceptData.description,
    bulletPoints: conceptData.bulletPoints || []
  });
  const [flashcards, setFlashcards] = useState<Array<{id: string; question: string; answer: string;}>>(
    conceptData.flashcards || []
  );
  const { toast } = useToast();
  
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
  
  // Initialize flashcards if none exist
  useEffect(() => {
    if (!flashcards || flashcards.length === 0) {
      // Create default flashcards based on the concept data
      const defaultFlashcards = [
        { 
          id: `card-${Date.now()}-1`, 
          question: `What is ${conceptData.label}?`, 
          answer: conceptData.description 
        },
        { 
          id: `card-${Date.now()}-2`, 
          question: `How does ${conceptData.label} relate to the broader topic?`, 
          answer: 'Add your understanding here.' 
        }
      ];
      setFlashcards(defaultFlashcards);
    }
  }, [conceptData.label, conceptData.description, flashcards]);

  // Handle flashcard save
  const handleSaveFlashcards = (updatedFlashcards: Array<{id: string; question: string; answer: string;}>) => {
    setFlashcards(updatedFlashcards);
    
    // If we have an onUpdate function, also update the parent component with the new flashcards
    if (onUpdate) {
      const updatedData = {
        ...editData,
        flashcards: updatedFlashcards
      };
      onUpdate(conceptId, updatedData);
    }
    
    toast({
      title: "Flashcards saved",
      description: `${updatedFlashcards.length} flashcards updated for this concept.`
    });
  };

  // Save changes
  const saveChanges = () => {
    if (onUpdate) {
      // Include flashcards in the update
      const updatedData = {
        ...editData,
        flashcards
      };
      onUpdate(conceptId, updatedData);
    }
    setIsEditing(false);
    
    toast({
      title: "Concept updated",
      description: "Your changes have been saved."
    });
  };

  // Mock videos that would come from YouTube API
  const mockVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  
  // Mock explanation that would come from Gemini API
  const mockExplanation = `
    <h3 class="text-lg font-semibold mb-2">${conceptData.label}</h3>
    <p class="mb-3">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, 
      nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl 
      nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl 
      aliquam nisl, eget ultricies nisl nisl eget nisl.
    </p>
    <h4 class="text-md font-semibold mb-2">Key Points</h4>
    <ul class="list-disc pl-5 mb-3">
      <li>First important point about this concept</li>
      <li>Second critical element to understand</li>
      <li>Relationship to other connected concepts</li>
      <li>Common misconceptions to avoid</li>
    </ul>
    <p class="text-sm text-gray-500 mt-4">
      This explanation was generated by AI to help you understand the concept better.
    </p>
  `;
  
  // Mock flashcards that would be generated by AI
  const mockFlashcards = [
    { question: 'What is the main purpose of this concept?', answer: 'To understand the fundamental principles that govern the subject area.' },
    { question: 'How does this concept relate to the broader topic?', answer: 'It serves as a foundational element that supports more complex ideas within the field.' },
    { question: 'What are common applications of this concept?', answer: 'This concept is applied in various scenarios including [specific examples related to the field].' }
  ];

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
              <ScrollArea className="h-[400px] px-1">
                {/* Use our new FlashcardEditor component */}
                <FlashcardEditor 
                  flashcards={flashcards.map(card => ({
                    id: card.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    question: card.question,
                    answer: card.answer
                  }))} 
                  onSave={handleSaveFlashcards}
                />
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