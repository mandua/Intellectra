import { useQuery } from "@tanstack/react-query";
import { FlashcardSet, Flashcard as FlashcardType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import FlashcardItem from "./FlashcardItem";

const Flashcards = () => {
  // Fetch flashcard sets and their cards
  const { data: flashcardSets, isLoading } = useQuery<FlashcardSet[]>({
    queryKey: ['/api/flashcard-sets'],
  });

  // Function to get flashcards for a set
  const { data: dsaFlashcards, isLoading: isLoadingDSA } = useQuery<FlashcardType[]>({
    queryKey: ['/api/flashcard-sets/1/flashcards'],
    enabled: !!flashcardSets && flashcardSets.length > 0,
  });
  
  const { data: archFlashcards, isLoading: isLoadingArch } = useQuery<FlashcardType[]>({
    queryKey: ['/api/flashcard-sets/2/flashcards'],
    enabled: !!flashcardSets && flashcardSets.length > 1,
  });

  const FlashcardSkeleton = () => (
    <div className="relative h-56 rounded-lg shadow-sm bg-neutral-200 dark:bg-neutral-700 animate-pulse">
      <div className="absolute inset-0 p-5 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600 mb-2"></div>
        <Skeleton className="h-6 w-4/5 mb-2" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Flashcards</h2>
        <button className="text-primary dark:text-primary-light flex items-center text-sm">
          <span>Create set</span>
          <span className="material-icons text-sm ml-1">add</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading || isLoadingDSA ? (
          <>
            <FlashcardSkeleton />
            <FlashcardSkeleton />
          </>
        ) : (
          <>
            {dsaFlashcards && dsaFlashcards.length > 0 && (
              <FlashcardItem 
                id="1"
                question={dsaFlashcards[0].question}
                answer={dsaFlashcards[0].answer}
                set={flashcardSets?.find(set => set.id === dsaFlashcards[0].setId)?.title || ""}
                color="secondary"
              />
            )}
            
            {archFlashcards && archFlashcards.length > 0 && (
              <FlashcardItem 
                id="2"
                question={archFlashcards[0].question}
                answer={archFlashcards[0].answer}
                set={flashcardSets?.find(set => set.id === archFlashcards[0].setId)?.title || ""}
                color="accent"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
