import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FlashcardSet, Flashcard as FlashcardType } from "@/lib/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Schemas
const flashcardSetSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
});

const flashcardSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
  answer: z.string().min(1, "Answer is required"),
});

const generateFlashcardsSchema = z.object({
  notes: z.string().min(10, "Notes must be at least 10 characters"),
  subject: z.string().min(1, "Subject is required"),
  count: z.string().transform(val => parseInt(val) || 5),
});

const Flashcards = () => {
  const { toast } = useToast();
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [generatedFlashcards, setGeneratedFlashcards] = useState<{question: string; answer: string}[] | null>(null);

  // Fetch flashcard sets
  const { data: flashcardSets, isLoading: setsLoading } = useQuery<FlashcardSet[]>({
    queryKey: ['/api/flashcard-sets'],
  });

  // Fetch flashcards for selected set
  const { data: flashcards, isLoading: cardsLoading } = useQuery<FlashcardType[]>({
    queryKey: ['/api/flashcard-sets', selectedSetId, 'flashcards'],
    enabled: !!selectedSetId,
  });

  // Fetch selected set details
  const { data: selectedSet } = useQuery<FlashcardSet>({
    queryKey: ['/api/flashcard-sets', selectedSetId],
    enabled: !!selectedSetId,
  });

  // Create set mutation
  const createSetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof flashcardSetSchema>) => {
      const res = await apiRequest('POST', '/api/flashcard-sets', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-sets'] });
      toast({ title: "Flashcard set created successfully!" });
      setIsSetDialogOpen(false);
      setSelectedSetId(data.id);
      setFormSet.reset({
        title: "",
        description: "",
        subject: "",
        tags: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create flashcard set",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create flashcard mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof flashcardSchema>) => {
      if (!selectedSetId) throw new Error("No flashcard set selected");
      const res = await apiRequest('POST', `/api/flashcard-sets/${selectedSetId}/flashcards`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-sets', selectedSetId, 'flashcards'] });
      toast({ title: "Flashcard created successfully!" });
      setIsCardDialogOpen(false);
      formCard.reset({
        question: "",
        answer: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create flashcard",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate flashcards mutation
  const generateCardsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof generateFlashcardsSchema>) => {
      const res = await apiRequest('POST', '/api/flashcards/generate', data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedFlashcards(data);
    },
    onError: (error) => {
      toast({
        title: "Failed to generate flashcards",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Forms
  const setFormSet = useForm<z.infer<typeof flashcardSetSchema>>({
    resolver: zodResolver(flashcardSetSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      tags: "",
    },
  });

  const formCard = useForm<z.infer<typeof flashcardSchema>>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const formGenerate = useForm<z.infer<typeof generateFlashcardsSchema>>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      notes: "",
      subject: "",
      count: "5",
    },
  });

  // Submit handlers
  const onSubmitSet = (values: z.infer<typeof flashcardSetSchema>) => {
    createSetMutation.mutate(values);
  };

  const onSubmitCard = (values: z.infer<typeof flashcardSchema>) => {
    createCardMutation.mutate(values);
  };

  const onSubmitGenerate = (values: z.infer<typeof generateFlashcardsSchema>) => {
    generateCardsMutation.mutate(values);
  };

  // Handle card flip
  const toggleCardFlip = (id: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Enter/exit study mode
  const toggleStudyMode = () => {
    setStudyMode(!studyMode);
    setCurrentCardIndex(0);
    setFlippedCards({});
  };

  // Navigate through study cards
  const nextCard = () => {
    if (flashcards && currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setFlippedCards({});
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setFlippedCards({});
    }
  };

  // Save generated flashcards to a set
  const saveGeneratedCards = async () => {
    if (!generatedFlashcards || !selectedSetId) return;
    
    try {
      // Create new set if needed
      let setId = selectedSetId;
      
      if (!setId) {
        const setData = setFormSet.getValues();
        if (!setData.title) {
          toast({
            title: "Please create or select a flashcard set first",
            variant: "destructive",
          });
          return;
        }
        
        const res = await apiRequest('POST', '/api/flashcard-sets', setData);
        const newSet = await res.json();
        setId = newSet.id;
        setSelectedSetId(setId);
      }
      
      // Add all generated cards to the set
      for (const card of generatedFlashcards) {
        await apiRequest('POST', `/api/flashcard-sets/${setId}/flashcards`, card);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-sets', setId, 'flashcards'] });
      toast({ title: `${generatedFlashcards.length} flashcards added successfully!` });
      setIsGenerateDialogOpen(false);
      setGeneratedFlashcards(null);
      formGenerate.reset();
      
    } catch (error) {
      toast({
        title: "Failed to save flashcards",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Flashcards</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Create, study, and master concepts with flashcards</p>
      </div>

      {studyMode && flashcards && flashcards.length > 0 ? (
        // Study Mode View
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold">{selectedSet?.title}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Card {currentCardIndex + 1} of {flashcards.length}
              </p>
            </div>
            <Button variant="outline" onClick={toggleStudyMode}>
              <span className="material-icons mr-1">close</span>
              Exit Study Mode
            </Button>
          </div>

          {/* Flashcard in study mode */}
          <div 
            className={`relative h-96 w-full rounded-lg shadow-sm flashcard cursor-pointer mb-6 ${
              flippedCards[currentCardIndex] ? 'flipped' : ''
            }`}
            onClick={() => toggleCardFlip(currentCardIndex)}
          >
            <div className="absolute inset-0 rounded-lg flashcard-front bg-secondary p-8 flex flex-col items-center justify-center text-white">
              <span className="material-icons mb-4 text-3xl">help_outline</span>
              <h3 className="text-xl font-bold text-center">{flashcards[currentCardIndex].question}</h3>
              <p className="text-sm mt-auto text-center text-white/70">Click to flip</p>
            </div>
            <div className="absolute inset-0 rounded-lg flashcard-back bg-secondary-dark p-8 flex flex-col items-center justify-center text-white">
              <span className="material-icons mb-4 text-3xl">lightbulb</span>
              <p className="text-lg text-center" style={{ whiteSpace: 'pre-line' }}>{flashcards[currentCardIndex].answer}</p>
              <p className="text-sm mt-auto text-center text-white/70">Click to flip back</p>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={prevCard} 
              disabled={currentCardIndex === 0}
              className="w-32"
            >
              <span className="material-icons mr-1">navigate_before</span>
              Previous
            </Button>
            <Button 
              onClick={nextCard} 
              disabled={currentCardIndex >= flashcards.length - 1}
              className="w-32"
            >
              Next
              <span className="material-icons ml-1">navigate_next</span>
            </Button>
          </div>
        </div>
      ) : (
        // Normal View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flashcard Sets */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Your Flashcard Sets</h2>
              <Button onClick={() => setIsSetDialogOpen(true)}>
                <span className="material-icons mr-1 text-sm">add</span>
                New Set
              </Button>
            </div>

            {setsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="mb-3">
                  <Skeleton className="h-24 w-full rounded-md mb-2" />
                </div>
              ))
            ) : flashcardSets && flashcardSets.length > 0 ? (
              <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                {flashcardSets.map((set) => (
                  <div 
                    key={set.id}
                    onClick={() => setSelectedSetId(set.id)}
                    className={`p-3 rounded-md border cursor-pointer hover:shadow-md transition-shadow ${
                      selectedSetId === set.id 
                        ? 'border-primary bg-primary-light/10' 
                        : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <h3 className="font-medium">{set.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                      {set.subject}
                    </p>
                    {set.description && (
                      <p className="text-sm line-clamp-2">{set.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <span className="material-icons text-4xl mb-2">style</span>
                <p>No flashcard sets yet. Create your first set.</p>
              </div>
            )}

            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsGenerateDialogOpen(true)}
                className="w-full"
              >
                <span className="material-icons mr-1">auto_fix_high</span>
                Generate from Notes
              </Button>
            </div>
          </div>

          {/* Flashcards for Selected Set */}
          <div className="lg:col-span-2">
            {selectedSetId ? (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{selectedSet?.title}</CardTitle>
                    <CardDescription>
                      {selectedSet?.subject}
                      {selectedSet?.tags && selectedSet.tags.length > 0 && (
                        <span> • {selectedSet.tags.join(', ')}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCardDialogOpen(true)}
                    >
                      <span className="material-icons text-sm mr-1">add</span>
                      Add Card
                    </Button>
                    {flashcards && flashcards.length > 0 && (
                      <Button 
                        size="sm"
                        onClick={toggleStudyMode}
                      >
                        <span className="material-icons text-sm mr-1">school</span>
                        Study
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {cardsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-md" />
                      ))}
                    </div>
                  ) : flashcards && flashcards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {flashcards.map((card, index) => (
                        <div 
                          key={card.id}
                          className={`relative h-36 rounded-lg shadow-sm flashcard cursor-pointer ${
                            flippedCards[index] ? 'flipped' : ''
                          }`}
                          onClick={() => toggleCardFlip(index)}
                        >
                          <div className="absolute inset-0 rounded-lg flashcard-front bg-secondary p-4 flex flex-col items-center justify-center text-white">
                            <span className="material-icons mb-2 text-sm">help_outline</span>
                            <h3 className="font-bold text-center text-sm">{card.question}</h3>
                            <p className="text-xs mt-auto text-center text-white/70">Click to flip</p>
                          </div>
                          <div className="absolute inset-0 rounded-lg flashcard-back bg-secondary-dark p-4 flex flex-col items-center justify-center text-white">
                            <span className="material-icons mb-2 text-sm">lightbulb</span>
                            <p className="text-sm text-center" style={{ whiteSpace: 'pre-line' }}>{card.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                      <span className="material-icons text-4xl mb-2">help_outline</span>
                      <p>No flashcards in this set yet. Add your first card.</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setIsCardDialogOpen(true)}
                      >
                        <span className="material-icons mr-1">add</span>
                        Add Flashcard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <span className="material-icons text-4xl text-neutral-400 mb-2">style</span>
                  <p>Select a flashcard set or create a new one</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setIsSetDialogOpen(true)}
                  >
                    <span className="material-icons mr-1">add</span>
                    Create New Set
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* New Set Dialog */}
      <Dialog open={isSetDialogOpen} onOpenChange={setIsSetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Flashcard Set</DialogTitle>
          </DialogHeader>
          
          <Form {...setFormSet}>
            <form onSubmit={setFormSet.handleSubmit(onSubmitSet)} className="space-y-4">
              <FormField
                control={setFormSet.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Set title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={setFormSet.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Math, Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={setFormSet.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Set description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={setFormSet.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., exam, midterm, important" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSetDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createSetMutation.isPending}>
                  {createSetMutation.isPending ? 'Creating...' : 'Create Set'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Card Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Flashcard</DialogTitle>
          </DialogHeader>
          
          <Form {...formCard}>
            <form onSubmit={formCard.handleSubmit(onSubmitCard)} className="space-y-4">
              <FormField
                control={formCard.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Flashcard question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formCard.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Flashcard answer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCardDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createCardMutation.isPending}>
                  {createCardMutation.isPending ? 'Adding...' : 'Add Card'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Generate Flashcards Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={(open) => {
        if (!open) setGeneratedFlashcards(null);
        setIsGenerateDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Flashcards with AI</DialogTitle>
          </DialogHeader>
          
          {!generatedFlashcards ? (
            <Form {...formGenerate}>
              <form onSubmit={formGenerate.handleSubmit(onSubmitGenerate)} className="space-y-4">
                <FormField
                  control={formGenerate.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Math, Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={formGenerate.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Flashcards</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={formGenerate.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste your notes here" className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={generateCardsMutation.isPending}>
                    {generateCardsMutation.isPending ? (
                      <>
                        <span className="material-icons animate-spin mr-2">refresh</span>
                        Generating...
                      </>
                    ) : 'Generate Flashcards'}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {generatedFlashcards.map((card, index) => (
                  <div key={index} className="mb-4">
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 p-3 rounded-md mb-2">
                      <p className="font-medium">Q: {card.question}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 p-3 rounded-md">
                      <p>A: {card.answer}</p>
                    </div>
                    {index < generatedFlashcards.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedFlashcards(null);
                    formGenerate.reset();
                  }}
                >
                  Start Over
                </Button>
                <Button onClick={saveGeneratedCards}>
                  Add to Flashcard Set
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Flashcards;
