import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, RotateCw, X } from 'lucide-react';

interface FlashCardProps {
  id: string;
  question: string;
  answer: string;
  onUpdate?: (id: string, question: string, answer: string) => void;
  color?: string;
}

export default function FlashCard({ 
  id, 
  question, 
  answer, 
  onUpdate,
  color = 'bg-blue-50 dark:bg-blue-950'
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState(question);
  const [editAnswer, setEditAnswer] = useState(answer);
  const [height, setHeight] = useState('auto');
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // Adjust height based on content
  useEffect(() => {
    if (!isEditing) {
      const calculateHeight = () => {
        const frontHeight = frontRef.current?.scrollHeight || 0;
        const backHeight = backRef.current?.scrollHeight || 0;
        return Math.max(frontHeight, backHeight, 120) + 'px';
      };
      
      setHeight(calculateHeight());
    } else {
      setHeight('auto');
    }
  }, [question, answer, isEditing]);

  // Handle card flip
  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  // Handle edit mode
  const handleEdit = () => {
    setIsFlipped(false);
    setIsEditing(true);
  };

  // Handle save edits
  const handleSave = () => {
    if (onUpdate) {
      onUpdate(id, editQuestion, editAnswer);
    }
    setIsEditing(false);
  };

  // Handle cancel edits
  const handleCancel = () => {
    setEditQuestion(question);
    setEditAnswer(answer);
    setIsEditing(false);
  };

  return (
    <div 
      className="relative perspective" 
      style={{ height }}
    >
      <div 
        className={`w-full transition-all duration-500 transform-style-3d`}
        style={{ 
          transformStyle: 'preserve-3d', 
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front side (Question) */}
        <div 
          ref={frontRef}
          className={`absolute w-full h-full backface-hidden ${color} rounded-lg p-6 shadow-md`}
          style={{ 
            backfaceVisibility: 'hidden',
            minHeight: '120px'
          }}
        >
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold mb-1">Question:</p>
                <Textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  placeholder="Enter question"
                  className="resize-none bg-white dark:bg-gray-800"
                  rows={3}
                />
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold mb-1">Answer:</p>
                <Textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  placeholder="Enter answer"
                  className="resize-none bg-white dark:bg-gray-800"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-medium">Question</h3>
                <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm">{question}</p>
              <Button 
                variant="outline" 
                onClick={handleFlip} 
                className="mt-4 w-full text-xs"
                size="sm"
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Flip to see answer
              </Button>
            </>
          )}
        </div>
        
        {/* Back side (Answer) */}
        <div 
          ref={backRef}
          className={`absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            minHeight: '120px'
          }}
        >
          {!isEditing && (
            <>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-medium">Answer</h3>
                <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm">{answer}</p>
              <Button 
                variant="outline" 
                onClick={handleFlip} 
                className="mt-4 w-full text-xs"
                size="sm"
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Back to question
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}