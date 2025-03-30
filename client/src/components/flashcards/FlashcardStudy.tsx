import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  masteryLevel: number;
  lastReviewed: string | null;
}

interface FlashcardDeck {
  id: number;
  title: string;
  description: string;
  subject: string;
}

interface FlashcardStudyProps {
  deck: FlashcardDeck;
  flashcards: Flashcard[];
  onUpdateMastery: (id: number, mastery: number) => void;
  onExit: () => void;
}

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  deck,
  flashcards,
  onUpdateMastery,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [studyOrder, setStudyOrder] = useState<number[]>([]);
  const [studyComplete, setStudyComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    mastered: 0,
    needsReview: 0,
  });

  // Initialize the study order - prioritize cards with lower mastery
  useEffect(() => {
    if (flashcards.length > 0) {
      // Sort cards by mastery level (lowest first) and shuffle cards with similar mastery
      const orderedIndices = [...flashcards]
        .sort((a, b) => a.masteryLevel - b.masteryLevel)
        .map((_, index) => index);
      
      setStudyOrder(orderedIndices);
      setProgress(0);
      
      // Initialize session stats
      const initialStats = {
        reviewed: 0,
        mastered: flashcards.filter(card => card.masteryLevel >= 80).length,
        needsReview: flashcards.filter(card => card.masteryLevel < 80).length,
      };
      setSessionStats(initialStats);
    }
  }, [flashcards]);

  const currentCard = flashcards[studyOrder[currentIndex]];

  const updateMasteryAndAdvance = (masteryChange: number) => {
    if (!currentCard) return;

    const newMastery = Math.max(0, Math.min(100, currentCard.masteryLevel + masteryChange));
    
    // Update mastery level
    onUpdateMastery(currentCard.id, newMastery);
    
    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      mastered: prev.mastered + (newMastery >= 80 && currentCard.masteryLevel < 80 ? 1 : 0) - 
                (newMastery < 80 && currentCard.masteryLevel >= 80 ? 1 : 0),
      needsReview: prev.needsReview - (newMastery >= 80 && currentCard.masteryLevel < 80 ? 1 : 0) + 
                  (newMastery < 80 && currentCard.masteryLevel >= 80 ? 1 : 0),
    }));

    // Move to next card
    if (currentIndex < studyOrder.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setProgress(((currentIndex + 1) / studyOrder.length) * 100);
    } else {
      setStudyComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setProgress(0);
    setStudyComplete(false);
  };

  if (studyComplete) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-8 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <span className="material-icons text-primary-DEFAULT dark:text-primary-light text-4xl mb-2">
            school
          </span>
          <h2 className="text-2xl font-medium mb-2">Study Session Complete!</h2>
          <p className="text-text-light-secondary dark:text-text-dark-secondary">
            You've reviewed all {flashcards.length} cards in this deck.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-medium mb-1">{sessionStats.reviewed}</div>
            <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
              Cards Reviewed
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <div className="text-3xl font-medium text-green-600 dark:text-green-400 mb-1">
              {sessionStats.mastered}
            </div>
            <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
              Mastered
            </div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
            <div className="text-3xl font-medium text-amber-600 dark:text-amber-400 mb-1">
              {sessionStats.needsReview}
            </div>
            <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
              Needs Review
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1" onClick={onExit}>
            <span className="material-icons mr-2">arrow_back</span>
            Return to Deck
          </Button>
          <Button className="flex-1" onClick={restartSession}>
            <span className="material-icons mr-2">refresh</span>
            Study Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center">
        <p>No flashcards available.</p>
        <Button onClick={onExit} className="mt-4">
          Return
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-medium">{deck.title}</h3>
          <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          <span className="material-icons mr-2">close</span>
          Exit
        </Button>
      </div>

      <Progress value={progress} className="mb-6" />

      <div className="perspective-1000 mx-auto max-w-xl">
        <div
          className={cn(
            "relative h-60 md:h-72 w-full transition-transform duration-500 transform-style-3d cursor-pointer",
            isFlipped ? "rotate-y-180" : ""
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <Card className="absolute inset-0 backface-hidden flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-lg">{currentCard.front}</p>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-4">
                Click to reveal answer
              </p>
            </div>
          </Card>

          {/* Back of card */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-lg">{currentCard.back}</p>
              <div className="mt-6 text-sm text-text-light-secondary dark:text-text-dark-secondary">
                How well did you know this?
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className={`mt-6 flex justify-center space-x-3 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
        <Button
          variant="outline"
          className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
          disabled={!isFlipped}
          onClick={() => updateMasteryAndAdvance(-10)}
        >
          <span className="material-icons mr-2">thumb_down</span>
          Difficult
        </Button>
        <Button
          variant="outline"
          className="bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          disabled={!isFlipped}
          onClick={() => updateMasteryAndAdvance(5)}
        >
          <span className="material-icons mr-2">thumb_up</span>
          Okay
        </Button>
        <Button
          variant="outline"
          className="bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
          disabled={!isFlipped}
          onClick={() => updateMasteryAndAdvance(15)}
        >
          <span className="material-icons mr-2">check_circle</span>
          Easy
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudy;
