import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  X, 
  Save, 
  Edit, 
  Rotate3D, 
  ChevronRight, 
  ChevronLeft, 
  FilePlus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

interface FlashcardEditorProps {
  flashcards: Flashcard[];
  onSave: (flashcards: Flashcard[]) => void;
}

export default function FlashcardEditor({ flashcards: initialFlashcards = [], onSave }: FlashcardEditorProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState<Flashcard | null>(null);
  const { toast } = useToast();

  // If no flashcards, start with one empty one
  useEffect(() => {
    if (initialFlashcards.length === 0) {
      setFlashcards([
        { id: `card-${Date.now()}`, question: '', answer: '' }
      ]);
    } else {
      setFlashcards(initialFlashcards);
    }
  }, [initialFlashcards]);

  // Get current flashcard
  const currentCard = flashcards[currentIndex] || { id: '', question: '', answer: '' };

  // Navigate to next card
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  // Navigate to previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Flip the current card
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Start editing the current card
  const handleEdit = () => {
    setEditedCard({ ...currentCard });
    setIsEditing(true);
  };

  // Add a new flashcard
  const handleAddCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      question: '',
      answer: ''
    };
    setFlashcards([...flashcards, newCard]);
    setCurrentIndex(flashcards.length);
    setIsFlipped(false);
    setEditedCard(newCard);
    setIsEditing(true);
  };

  // Remove the current flashcard
  const handleRemoveCard = () => {
    if (flashcards.length <= 1) {
      // Don't allow removing the last card
      toast({
        title: "Cannot remove card",
        description: "At least one flashcard is required.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedFlashcards = [...flashcards];
    updatedFlashcards.splice(currentIndex, 1);
    setFlashcards(updatedFlashcards);
    
    // Adjust current index if needed
    if (currentIndex >= updatedFlashcards.length) {
      setCurrentIndex(Math.max(0, updatedFlashcards.length - 1));
    }
    
    toast({
      title: "Card removed",
      description: "Flashcard removed successfully.",
    });
  };

  // Save current card being edited
  const handleSaveCard = () => {
    if (!editedCard) return;
    
    if (!editedCard.question.trim() || !editedCard.answer.trim()) {
      toast({
        title: "Incomplete card",
        description: "Both question and answer are required.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex] = editedCard;
    setFlashcards(updatedFlashcards);
    setIsEditing(false);
    
    // Save the entire deck
    onSave(updatedFlashcards);
    
    toast({
      title: "Card saved",
      description: "Flashcard saved successfully.",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCard(null);
  };

  // Update edited card
  const handleEditChange = (field: 'question' | 'answer', value: string) => {
    if (!editedCard) return;
    setEditedCard({
      ...editedCard,
      [field]: value
    });
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Flashcards</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddCard}>
            <FilePlus className="h-4 w-4 mr-1" />
            Add Card
          </Button>
        </div>
      </div>
      
      <div className="relative w-full aspect-[4/3] min-h-[300px] perspective-1000">
        {isEditing ? (
          <Card className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden shadow-md">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Question</p>
                  <Textarea
                    value={editedCard?.question || ''}
                    onChange={(e) => handleEditChange('question', e.target.value)}
                    placeholder="Enter the question here..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Answer</p>
                  <Textarea
                    value={editedCard?.answer || ''}
                    onChange={(e) => handleEditChange('answer', e.target.value)}
                    placeholder="Enter the answer here..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveCard}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Card
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card 
            className={`absolute inset-0 w-full h-full transition-all duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            } preserve-3d cursor-pointer shadow-md`}
            onClick={handleFlip}
          >
            {/* Front of card (Question) */}
            <div className={`absolute inset-0 backface-hidden p-4 flex flex-col ${
              isFlipped ? 'invisible' : ''
            } bg-white dark:bg-gray-800`}>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">Card {currentIndex + 1} of {flashcards.length}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCard();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <ScrollArea className="w-full h-[200px]">
                  <div className="text-center p-4">
                    <h3 className="text-xl font-medium mb-2">Question</h3>
                    <p>{currentCard.question || 'Click to add a question'}</p>
                  </div>
                </ScrollArea>
              </div>
              
              <div className="text-center mt-2 text-sm text-primary flex items-center justify-center">
                <Rotate3D className="h-4 w-4 mr-1" />
                Click to flip
              </div>
            </div>
            
            {/* Back of card (Answer) */}
            <div className={`absolute inset-0 backface-hidden p-4 flex flex-col rotate-y-180 ${
              !isFlipped ? 'invisible' : ''
            } bg-white dark:bg-gray-800`}>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">Card {currentIndex + 1} of {flashcards.length}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <ScrollArea className="w-full h-[200px]">
                  <div className="text-center p-4">
                    <h3 className="text-xl font-medium mb-2">Answer</h3>
                    <p>{currentCard.answer || 'Click to add an answer'}</p>
                  </div>
                </ScrollArea>
              </div>
              
              <div className="text-center mt-2 text-sm text-primary flex items-center justify-center">
                <Rotate3D className="h-4 w-4 mr-1" />
                Click to flip
              </div>
            </div>
          </Card>
        )}
      </div>
      
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isEditing}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1 || isEditing}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}