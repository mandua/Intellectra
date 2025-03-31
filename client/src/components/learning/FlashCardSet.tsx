import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FlashCard from './FlashCard';
import { Brain, Shuffle, Plus, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FlashCardItem = {
  id: string;
  question: string;
  answer: string;
};

interface FlashCardSetProps {
  title: string;
  description?: string;
  cards: FlashCardItem[];
  onCardUpdate?: (cardId: string, question: string, answer: string) => void;
  onAddCard?: () => void;
}

export default function FlashCardSet({
  title,
  description,
  cards,
  onCardUpdate,
  onAddCard
}: FlashCardSetProps) {
  const [cardItems, setCardItems] = useState<FlashCardItem[]>(cards);
  const { toast } = useToast();

  // Handle card updates
  const handleCardUpdate = useCallback((id: string, question: string, answer: string) => {
    setCardItems(prev => prev.map(card => 
      card.id === id ? { ...card, question, answer } : card
    ));
    
    if (onCardUpdate) {
      onCardUpdate(id, question, answer);
    }
    
    toast({
      title: 'Card Updated',
      description: 'Your flashcard has been updated successfully.',
    });
  }, [onCardUpdate, toast]);

  // Shuffle cards
  const shuffleCards = useCallback(() => {
    setCardItems(prev => {
      const shuffled = [...prev];
      // Fisher-Yates shuffle algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    
    toast({
      title: 'Cards Shuffled',
      description: 'Study these flashcards in a new random order.',
    });
  }, [toast]);

  // Generate PDF (mock functionality)
  const handleExportPDF = () => {
    toast({
      title: 'Exporting Flashcards',
      description: 'Your flashcards would be exported as PDF in a real application.',
    });
  };

  // Card colors for variety
  const cardColors = [
    'bg-blue-50 dark:bg-blue-950',
    'bg-purple-50 dark:bg-purple-950',
    'bg-green-50 dark:bg-green-950',
    'bg-amber-50 dark:bg-amber-950',
    'bg-rose-50 dark:bg-rose-950'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <div>
            <span className="text-sm text-gray-500">{cardItems.length} cards in this set</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shuffleCards}>
              <Shuffle className="h-4 w-4 mr-1" />
              Shuffle
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cardItems.map((card, index) => (
            <FlashCard
              key={card.id}
              id={card.id}
              question={card.question}
              answer={card.answer}
              onUpdate={handleCardUpdate}
              color={cardColors[index % cardColors.length]}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onAddCard} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add New Flashcard
        </Button>
      </CardFooter>
    </Card>
  );
}