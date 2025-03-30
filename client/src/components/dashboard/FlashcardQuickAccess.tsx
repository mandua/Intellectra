import React from "react";
import { getMasteryInfo } from "@/lib/utils";

interface FlashcardDeck {
  id: number;
  title: string;
  description: string;
  subject: string;
  cardsCount: number;
  masteryLevel: number;
  lastStudied: string;
}

interface FlashcardQuickAccessProps {
  decks: FlashcardDeck[];
  onViewAll: () => void;
  onContinueLearning: (deckId: number) => void;
  onCreateNew: () => void;
}

const FlashcardQuickAccess: React.FC<FlashcardQuickAccessProps> = ({
  decks,
  onViewAll,
  onContinueLearning,
  onCreateNew,
}) => {
  // Calculate days since last studied
  const getDaysSinceStudied = (lastStudiedDate: string) => {
    if (!lastStudiedDate) return "Never studied";
    
    const lastStudied = new Date(lastStudiedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastStudied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Studied today";
    if (diffDays === 1) return "Studied yesterday";
    return `Last studied ${diffDays} days ago`;
  };

  return (
    <div className="md:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Flashcard Collections</h3>
        <button
          onClick={onViewAll}
          className="text-primary-DEFAULT dark:text-primary-light font-medium"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {decks.map((deck) => {
          const { label: masteryLabel, color: masteryColor } = getMasteryInfo(deck.masteryLevel);
          const daysSinceStudied = getDaysSinceStudied(deck.lastStudied);
          
          return (
            <div
              key={deck.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-DEFAULT dark:hover:border-primary-dark transition-colors"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{deck.title}</h4>
                <span className="text-sm bg-primary-light/10 dark:bg-primary-light/20 text-primary-DEFAULT dark:text-primary-light px-2 py-0.5 rounded">
                  {deck.cardsCount} cards
                </span>
              </div>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
                {deck.description}
              </p>
              <div className="mt-3 flex items-center text-sm text-text-light-secondary dark:text-text-dark-secondary">
                <span className={`material-icons ${masteryColor} text-sm mr-1`}>
                  {deck.masteryLevel >= 60 ? "check_circle" : "refresh"}
                </span>
                <span>{deck.masteryLevel}% mastery</span>
                <span className="mx-2">•</span>
                <span>{daysSinceStudied}</span>
              </div>
              <button
                onClick={() => onContinueLearning(deck.id)}
                className="mt-3 w-full py-1.5 border border-primary-DEFAULT text-primary-DEFAULT dark:text-primary-light hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 rounded transition-colors"
              >
                Continue Learning
              </button>
            </div>
          );
        })}

        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-center">
          <span className="material-icons text-2xl text-text-light-secondary dark:text-text-dark-secondary mb-2">
            add_circle_outline
          </span>
          <h4 className="font-medium">Create New Collection</h4>
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
            Generate AI flashcards from your notes or create your own
          </p>
          <button
            onClick={onCreateNew}
            className="mt-3 w-full py-1.5 bg-primary-DEFAULT hover:bg-primary-light text-white rounded transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardQuickAccess;
