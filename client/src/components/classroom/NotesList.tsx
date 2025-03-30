import React from "react";
import { formatDate, getSubjectColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: number;
  title: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  keyPoints: string[];
}

interface NotesListProps {
  notes: Note[];
  selectedNoteId?: number;
  isLoading: boolean;
  onNoteSelect: (note: Note) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  isLoading,
  onNoteSelect,
}) => {
  // Function to extract a preview from the note content
  const getPreview = (content: string): string => {
    const maxLength = 120;
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary h-[calc(100vh-300px)] flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
        <span className="material-icons text-4xl mb-2">note_add</span>
        <p className="mb-1">No notes yet</p>
        <p className="text-sm">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-3 pr-3">
        {notes.map((note) => {
          const isSelected = selectedNoteId === note.id;
          const subjectClasses = getSubjectColor(note.subject);
          
          return (
            <div
              key={note.id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary-light/10 dark:bg-primary-dark/20 border border-primary-DEFAULT dark:border-primary-light"
                  : "bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 hover:border-primary-light dark:hover:border-primary-dark"
              }`}
              onClick={() => onNoteSelect(note)}
            >
              <h4 className="font-medium mb-1">{note.title}</h4>
              
              <div className="flex items-center mb-2">
                {note.subject && (
                  <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${subjectClasses}`}>
                    {note.subject}
                  </span>
                )}
                <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
              
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary line-clamp-2">
                {getPreview(note.content)}
              </p>
              
              {note.keyPoints && note.keyPoints.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {note.keyPoints.slice(0, 2).map((point, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-text-light-secondary dark:text-text-dark-secondary px-2 py-0.5 rounded-full"
                    >
                      {point}
                    </span>
                  ))}
                  {note.keyPoints.length > 2 && (
                    <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                      +{note.keyPoints.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default NotesList;
