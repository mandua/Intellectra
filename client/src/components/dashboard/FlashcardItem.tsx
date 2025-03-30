import { useState } from "react";

type FlashcardItemProps = {
  id: string;
  question: string;
  answer: string;
  set: string;
  color: "primary" | "secondary" | "accent";
};

const FlashcardItem = ({ id, question, answer, set, color }: FlashcardItemProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getBgColor = (isFlipped: boolean) => {
    if (color === "primary") {
      return isFlipped ? "bg-primary-dark" : "bg-primary";
    } else if (color === "secondary") {
      return isFlipped ? "bg-secondary-dark" : "bg-secondary";
    } else {
      return isFlipped ? "bg-accent-dark" : "bg-accent";
    }
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`relative h-56 rounded-lg shadow-sm flashcard cursor-pointer ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
      id={`flashcard-${id}`}
    >
      <div className={`absolute inset-0 rounded-lg flashcard-front ${getBgColor(false)} p-5 flex flex-col items-center justify-center text-white`}>
        <span className="material-icons mb-2">help_outline</span>
        <h3 className="font-bold text-center">{question}</h3>
        <p className="text-xs mt-auto text-center text-white/70">{set}</p>
      </div>
      <div className={`absolute inset-0 rounded-lg flashcard-back ${getBgColor(true)} p-5 flex flex-col items-center justify-center text-white`}>
        <span className="material-icons mb-2">lightbulb</span>
        <p className="text-center">{answer}</p>
      </div>
    </div>
  );
};

export default FlashcardItem;
