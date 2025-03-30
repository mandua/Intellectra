import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FlashcardDeck from "@/components/flashcards/FlashcardDeck";
import FlashcardCreator from "@/components/flashcards/FlashcardCreator";
import FlashcardStudy from "@/components/flashcards/FlashcardStudy";
import { generateFlashcardsFromNotes, generateQuiz } from "@/lib/ai";

const Flashcards = () => {
  const [location, navigate] = useLocation();
  const [selectedDeck, setSelectedDeck] = useState<any>(null);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [subject, setSubject] = useState("");
  const [isGeneratingOpen, setIsGeneratingOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all decks
  const { data: decks, isLoading: isLoadingDecks } = useQuery({
    queryKey: ['/api/flashcard-decks'],
  });

  // Fetch selected deck details and flashcards
  const { data: deckFlashcards, isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ['/api/flashcard-decks', selectedDeck?.id, 'flashcards'],
    queryFn: async () => {
      if (!selectedDeck?.id) return [];
      const res = await fetch(`/api/flashcard-decks/${selectedDeck.id}/flashcards`);
      if (!res.ok) throw new Error("Failed to fetch flashcards");
      return res.json();
    },
    enabled: !!selectedDeck?.id
  });

  // Fetch all notes for AI generation
  const { data: notes } = useQuery({
    queryKey: ['/api/notes'],
  });

  // Create deck mutation
  const { mutate: createDeck, isPending: isCreatingDeckMutation } = useMutation({
    mutationFn: async (deck: any) => {
      return apiRequest("POST", "/api/flashcard-decks", deck);
    },
    onSuccess: (response) => {
      response.json().then(newDeck => {
        queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
        setSelectedDeck(newDeck);
        setIsCreatingDeck(false);
        toast({
          title: "Success",
          description: "Flashcard deck created successfully",
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create deck: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create flashcard mutation
  const { mutate: createFlashcard, isPending: isCreatingFlashcard } = useMutation({
    mutationFn: async (flashcard: any) => {
      if (!selectedDeck?.id) throw new Error("No deck selected");
      return apiRequest("POST", `/api/flashcard-decks/${selectedDeck.id}/flashcards`, flashcard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks', selectedDeck?.id, 'flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
      toast({
        title: "Success",
        description: "Flashcard added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create flashcard: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update flashcard mastery mutation
  const { mutate: updateFlashcardMastery } = useMutation({
    mutationFn: async ({ id, masteryLevel }: { id: number, masteryLevel: number }) => {
      return apiRequest("PATCH", `/api/flashcards/${id}/mastery`, { masteryLevel });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks', selectedDeck?.id, 'flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update flashcard mastery: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete flashcard mutation
  const { mutate: deleteFlashcard } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/flashcards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks', selectedDeck?.id, 'flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
      toast({
        title: "Success",
        description: "Flashcard deleted successfully",
      });
    }
  });

  // Delete deck mutation
  const { mutate: deleteDeck } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/flashcard-decks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
      setSelectedDeck(null);
      toast({
        title: "Success",
        description: "Deck deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete deck: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Generate flashcards from notes mutation
  const { mutate: generateFlashcards, isPending: isGeneratingFlashcards } = useMutation({
    mutationFn: async ({ content, subject, count }: { content: string, subject: string, count: number }) => {
      return generateFlashcardsFromNotes(content, subject, count);
    },
    onSuccess: (flashcards) => {
      setGeneratedFlashcards(flashcards);
      toast({
        title: "Success",
        description: `Generated ${flashcards.length} flashcards`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate flashcards: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Generate quiz mutation
  const { mutate: generateQuizQuestions, isPending: isGeneratingQuiz } = useMutation({
    mutationFn: async ({ deckId, count }: { deckId: number, count: number }) => {
      return generateQuiz(deckId, count);
    },
    onSuccess: (quiz) => {
      setQuizQuestions(quiz);
      setIsQuizMode(true);
      toast({
        title: "Success",
        description: `Generated ${quiz.length} quiz questions`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate quiz: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCreateDeck = (deck: any) => {
    createDeck({
      ...deck,
      userId: 1 // Demo user ID
    });
  };

  const handleAddFlashcard = (flashcard: any) => {
    createFlashcard(flashcard);
  };

  const handleGenerateFlashcards = () => {
    if (!noteContent || !subject) {
      toast({
        title: "Error",
        description: "Please provide note content and subject",
        variant: "destructive",
      });
      return;
    }

    generateFlashcards({
      content: noteContent,
      subject,
      count: 5
    });
  };

  const handleAddGeneratedFlashcards = () => {
    if (!selectedDeck?.id) {
      toast({
        title: "Error",
        description: "Please select a deck first",
        variant: "destructive",
      });
      return;
    }

    // Add each flashcard sequentially
    generatedFlashcards.forEach(card => {
      createFlashcard({
        front: card.front,
        back: card.back
      });
    });

    setIsGeneratingOpen(false);
    setGeneratedFlashcards([]);
  };

  const handleStartQuiz = () => {
    if (!selectedDeck?.id) return;
    
    generateQuizQuestions({
      deckId: selectedDeck.id,
      count: 5
    });
  };

  const handleExitQuiz = () => {
    setIsQuizMode(false);
    setQuizQuestions([]);
  };

  // If in study mode, show the study component
  if (isStudyMode && selectedDeck && deckFlashcards) {
    return (
      <FlashcardStudy
        deck={selectedDeck}
        flashcards={deckFlashcards}
        onUpdateMastery={(id, mastery) => updateFlashcardMastery({ id, masteryLevel: mastery })}
        onExit={() => setIsStudyMode(false)}
      />
    );
  }

  // If in quiz mode, show the quiz component
  if (isQuizMode && quizQuestions.length > 0) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Quiz: {selectedDeck?.title}</h3>
          <Button variant="outline" onClick={handleExitQuiz}>
            <span className="material-icons mr-2">close</span>
            Exit Quiz
          </Button>
        </div>

        <div className="space-y-8">
          {quizQuestions.map((question, qIndex) => (
            <div key={qIndex} className="border border-border rounded-lg p-4">
              <h4 className="text-lg font-medium mb-3">Question {qIndex + 1}:</h4>
              <p className="mb-4">{question.question}</p>
              
              <div className="space-y-2 mb-4">
                {question.options.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="flex items-center">
                    <input
                      type="radio"
                      id={`q${qIndex}-o${oIndex}`}
                      name={`question-${qIndex}`}
                      className="mr-2"
                    />
                    <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                  </div>
                ))}
              </div>
              
              <details className="text-sm">
                <summary className="cursor-pointer text-primary-DEFAULT dark:text-primary-light font-medium">
                  Show Answer
                </summary>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="font-medium mb-1">
                    Correct answer: {question.options[question.correctOptionIndex]}
                  </p>
                  <p>{question.explanation}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-medium">Flashcards & Quizzes</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsGeneratingOpen(true)}
          >
            <span className="material-icons mr-2">psychology</span>
            Generate from Notes
          </Button>
          <Button onClick={() => {
            setSelectedDeck(null);
            setIsCreatingDeck(true);
          }}>
            <span className="material-icons mr-2">add</span>
            New Deck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isLoadingDecks ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5 h-48 animate-pulse" />
          ))
        ) : decks?.length > 0 ? (
          decks.map((deck: any) => (
            <div
              key={deck.id}
              className={`bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5 cursor-pointer transition-all ${
                selectedDeck?.id === deck.id
                  ? "ring-2 ring-primary-DEFAULT dark:ring-primary-light"
                  : "hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedDeck(deck);
                setIsCreatingDeck(false);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{deck.title}</h3>
                <span className="text-sm bg-primary-light/10 dark:bg-primary-light/20 text-primary-DEFAULT dark:text-primary-light px-2 py-0.5 rounded">
                  {deck.cardsCount} cards
                </span>
              </div>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-4 line-clamp-2">
                {deck.description}
              </p>
              <div className="mt-auto">
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mastery level</span>
                    <span>{deck.masteryLevel}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-DEFAULT"
                      style={{ width: `${deck.masteryLevel}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                  {deck.lastStudied
                    ? `Last studied: ${new Date(deck.lastStudied).toLocaleDateString()}`
                    : "Not studied yet"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-4 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-8 text-center">
            <span className="material-icons text-4xl text-text-light-secondary dark:text-text-dark-secondary mb-2">
              style
            </span>
            <h3 className="text-lg font-medium mb-2">No Flashcard Decks</h3>
            <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4">
              Create your first flashcard deck to start studying
            </p>
            <Button onClick={() => {
              setSelectedDeck(null);
              setIsCreatingDeck(true);
            }}>
              Create Deck
            </Button>
          </div>
        )}
      </div>

      {(selectedDeck || isCreatingDeck) && (
        <div className="mt-8 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
          {isCreatingDeck ? (
            <div>
              <h3 className="text-xl font-medium mb-4">Create New Deck</h3>
              <FlashcardCreator
                onCreateDeck={handleCreateDeck}
                isCreating={isCreatingDeckMutation}
                onCancel={() => setIsCreatingDeck(false)}
              />
            </div>
          ) : (
            <Tabs defaultValue="cards">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-medium">{selectedDeck?.title}</h3>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary">
                    {selectedDeck?.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={handleStartQuiz}
                    disabled={isGeneratingQuiz || (deckFlashcards?.length || 0) < 3}
                  >
                    {isGeneratingQuiz ? (
                      <span className="material-icons animate-spin mr-2">autorenew</span>
                    ) : (
                      <span className="material-icons mr-2">quiz</span>
                    )}
                    Take a Quiz
                  </Button>
                  <Button 
                    onClick={() => setIsStudyMode(true)}
                    disabled={(deckFlashcards?.length || 0) === 0}
                  >
                    <span className="material-icons mr-2">school</span>
                    Study Deck
                  </Button>
                </div>
              </div>

              <TabsList>
                <TabsTrigger value="cards">Flashcards</TabsTrigger>
                <TabsTrigger value="add">Add Card</TabsTrigger>
                <TabsTrigger value="manage">Manage Deck</TabsTrigger>
              </TabsList>

              <TabsContent value="cards">
                <FlashcardDeck
                  flashcards={deckFlashcards || []}
                  isLoading={isLoadingFlashcards}
                  onDeleteCard={(id) => deleteFlashcard(id)}
                />
              </TabsContent>

              <TabsContent value="add">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-4">Add New Flashcard</h3>
                  <FlashcardCreator
                    deckId={selectedDeck?.id}
                    onAddFlashcard={handleAddFlashcard}
                    isCreating={isCreatingFlashcard}
                  />
                </div>
              </TabsContent>

              <TabsContent value="manage">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Deck Information</h3>
                    <p className="mb-4">
                      <span className="font-medium">Subject:</span> {selectedDeck?.subject}
                    </p>
                    <p className="mb-4">
                      <span className="font-medium">Created:</span> {new Date(selectedDeck?.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mb-4">
                      <span className="font-medium">Cards:</span> {selectedDeck?.cardsCount}
                    </p>
                    <p className="mb-4">
                      <span className="font-medium">Mastery Level:</span> {selectedDeck?.masteryLevel}%
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg bg-red-50 dark:bg-red-900/10">
                    <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h3>
                    <p className="mb-4 text-text-light-secondary dark:text-text-dark-secondary">
                      Deleting a deck will permanently remove all associated flashcards.
                    </p>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
                          deleteDeck(selectedDeck.id);
                        }
                      }}
                    >
                      <span className="material-icons mr-2">delete_forever</span>
                      Delete Deck
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      <Dialog open={isGeneratingOpen} onOpenChange={setIsGeneratingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Flashcards from Notes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select a Note</label>
              <select 
                className="w-full p-2 border border-border rounded-md bg-white dark:bg-[#1e1e1e]"
                onChange={(e) => {
                  const selectedNote = notes?.find((note: any) => note.id === parseInt(e.target.value));
                  if (selectedNote) {
                    setNoteContent(selectedNote.content);
                    setSubject(selectedNote.subject || "");
                  }
                }}
              >
                <option value="">-- Select a note --</option>
                {notes?.map((note: any) => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <input
                type="text"
                className="w-full p-2 border border-border rounded-md bg-white dark:bg-[#1e1e1e]"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note Content</label>
              <textarea
                className="w-full p-2 border border-border rounded-md bg-white dark:bg-[#1e1e1e] h-32"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Or enter note content manually"
              />
            </div>

            {generatedFlashcards.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">Generated Flashcards:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-border rounded-md">
                  {generatedFlashcards.map((card, index) => (
                    <div key={index} className="p-3 border border-border rounded-md">
                      <p className="font-medium mb-1">Front: {card.front}</p>
                      <p className="text-text-light-secondary dark:text-text-dark-secondary">
                        Back: {card.back}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setGeneratedFlashcards([]);
                    }}
                  >
                    Regenerate
                  </Button>
                  <Button onClick={handleAddGeneratedFlashcards}>
                    Add to Deck
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsGeneratingOpen(false);
                    setNoteContent("");
                    setSubject("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFlashcards || !noteContent || !subject}
                >
                  {isGeneratingFlashcards ? (
                    <span className="material-icons animate-spin mr-2">autorenew</span>
                  ) : (
                    <span className="material-icons mr-2">psychology</span>
                  )}
                  Generate Flashcards
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Flashcards;
