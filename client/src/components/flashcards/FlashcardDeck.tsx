import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getMasteryInfo } from "@/lib/utils";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  masteryLevel: number;
  lastReviewed: string | null;
}

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  isLoading: boolean;
  onDeleteCard: (id: number) => void;
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  flashcards,
  isLoading,
  onDeleteCard,
}) => {
  const [flippedCards, setFlippedCards] = React.useState<{ [key: number]: boolean }>({});

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary">
        <span className="material-icons text-4xl mb-2">style</span>
        <p>No flashcards in this deck yet</p>
        <p className="text-sm">Start adding flashcards to study</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {flashcards.map((card) => {
        const isFlipped = flippedCards[card.id] || false;
        const { label: masteryLabel, color: masteryColor } = getMasteryInfo(card.masteryLevel);

        return (
          <div
            key={card.id}
            className="h-48 perspective-1000 group"
            onClick={() => toggleFlip(card.id)}
          >
            <div
              className={cn(
                "relative h-full w-full transition-transform duration-500 transform-style-3d cursor-pointer",
                isFlipped ? "rotate-y-180" : ""
              )}
            >
              {/* Front of card */}
              <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col">
                <div className="flex-grow flex items-center justify-center p-2 text-center">
                  <p>{card.front}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-text-light-secondary dark:text-text-dark-secondary pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <span className={`material-icons ${masteryColor} text-sm mr-1`}>
                      {card.masteryLevel >= 60 ? "check_circle" : "refresh"}
                    </span>
                    <span>{masteryLabel}</span>
                  </div>
                  <span>Click to flip</span>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col">
                <div className="flex-grow flex items-center justify-center p-2 text-center">
                  <p>{card.back}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-text-light-secondary dark:text-text-dark-secondary pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    {card.lastReviewed && (
                      <span>
                        Last reviewed: {new Date(card.lastReviewed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this flashcard?")) {
                          onDeleteCard(card.id);
                        }
                      }}
                    >
                      <span className="material-icons text-red-500 dark:text-red-400 text-sm">
                        delete
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FlashcardDeck;
