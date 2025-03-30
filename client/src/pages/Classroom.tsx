import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/lib/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Form schema for notes
const noteSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  subject: z.string().min(1, "Subject is required"),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
});

// Form schema for AI enhancement
const enhanceSchema = z.object({
  notes: z.string().min(10, "Notes must be at least 10 characters"),
  subject: z.string().min(1, "Subject is required"),
});

const Classroom = () => {
  const { toast } = useToast();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [isEnhanceDialogOpen, setIsEnhanceDialogOpen] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{ enhancedNotes: string; keyConcepts: string[] } | null>(null);

  // Fetch notes
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: z.infer<typeof noteSchema>) => {
      const res = await apiRequest('POST', '/api/notes', noteData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({ title: "Note created successfully!" });
      setIsNewNoteDialogOpen(false);
      form.reset({
        title: "",
        content: "",
        subject: "",
        tags: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create note",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // AI enhance notes mutation
  const enhanceNotesMutation = useMutation({
    mutationFn: async (data: { notes: string; subject: string }) => {
      const res = await apiRequest('POST', '/api/notes/enhance', data);
      return res.json();
    },
    onSuccess: (data) => {
      setEnhancedResult(data);
    },
    onError: (error) => {
      toast({
        title: "Failed to enhance notes",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Form for new note
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      subject: "",
      tags: "",
    },
  });

  // Form for AI enhancement
  const enhanceForm = useForm<z.infer<typeof enhanceSchema>>({
    resolver: zodResolver(enhanceSchema),
    defaultValues: {
      notes: "",
      subject: "",
    },
  });

  // Submit handlers
  const onSubmitNote = (values: z.infer<typeof noteSchema>) => {
    createNoteMutation.mutate(values);
  };

  const onSubmitEnhance = (values: z.infer<typeof enhanceSchema>) => {
    enhanceNotesMutation.mutate(values);
  };

  // View a specific note
  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Classroom Companion</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Organize and enhance your notes with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Your Notes</h2>
            <Button onClick={() => setIsNewNoteDialogOpen(true)}>
              <span className="material-icons mr-1 text-sm">add</span>
              New Note
            </Button>
          </div>

          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="mb-3">
                <Skeleton className="h-24 w-full rounded-md mb-2" />
              </div>
            ))
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
              {notes.map((note) => (
                <div 
                  key={note.id}
                  onClick={() => handleViewNote(note)}
                  className={`p-3 rounded-md border cursor-pointer hover:shadow-md transition-shadow ${
                    selectedNote?.id === note.id 
                      ? 'border-primary bg-primary-light/10' 
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    {note.subject} • {formatDate(note.updatedAt)}
                  </p>
                  <p className="text-sm line-clamp-2">{note.content.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <span className="material-icons text-4xl mb-2">note_add</span>
              <p>No notes yet. Create your first note.</p>
            </div>
          )}
        </div>

        {/* Note Content & AI Tools */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="view">View Note</TabsTrigger>
              <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              {selectedNote ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedNote.title}</CardTitle>
                        <CardDescription>
                          {selectedNote.subject} • Last updated {formatDate(selectedNote.updatedAt)}
                        </CardDescription>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          <span className="material-icons text-sm mr-1">edit</span>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <p style={{ whiteSpace: 'pre-line' }}>{selectedNote.content}</p>
                    </div>
                    
                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedNote.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">description</span>
                    <p>Select a note to view its content</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ai-tools">
              <Card>
                <CardHeader>
                  <CardTitle>AI Study Assistant</CardTitle>
                  <CardDescription>
                    Use AI to enhance your notes, generate flashcards, or highlight key concepts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-primary-light/10 flex items-center justify-center text-primary dark:text-primary-light mb-3">
                        <span className="material-icons">auto_fix_high</span>
                      </div>
                      <h3 className="font-medium mb-1">Enhance Notes</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Improve your notes with AI suggestions and clarifications
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEnhanceDialogOpen(true)}
                      >
                        Enhance now
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-secondary-light/10 flex items-center justify-center text-secondary dark:text-secondary-light mb-3">
                        <span className="material-icons">style</span>
                      </div>
                      <h3 className="font-medium mb-1">Generate Flashcards</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Convert your notes into effective study flashcards
                      </p>
                      <Button 
                        variant="outline"
                        disabled={!selectedNote} 
                        onClick={() => {
                          if (selectedNote) {
                            toast({
                              title: "Generating flashcards",
                              description: "This feature will redirect to the Flashcards page when implemented"
                            });
                          }
                        }}
                      >
                        Generate cards
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-accent-light/10 flex items-center justify-center text-accent dark:text-accent-light mb-3">
                        <span className="material-icons">highlight</span>
                      </div>
                      <h3 className="font-medium mb-1">Highlight Key Concepts</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Identify and highlight the most important concepts
                      </p>
                      <Button 
                        variant="outline"
                        disabled={!selectedNote}
                      >
                        Highlight concepts
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mb-3">
                        <span className="material-icons">quiz</span>
                      </div>
                      <h3 className="font-medium mb-1">Generate Practice Quiz</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Create a quiz based on your note content
                      </p>
                      <Button 
                        variant="outline"
                        disabled={!selectedNote}
                      >
                        Create quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* New Note Dialog */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNote)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Note title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
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
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Note content" className="min-h-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., lecture, important, exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsNewNoteDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createNoteMutation.isPending}>
                  {createNoteMutation.isPending ? 'Creating...' : 'Create Note'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Enhance Notes Dialog */}
      <Dialog open={isEnhanceDialogOpen} onOpenChange={setIsEnhanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enhance Notes with AI</DialogTitle>
          </DialogHeader>
          
          {!enhancedResult ? (
            <Form {...enhanceForm}>
              <form onSubmit={enhanceForm.handleSubmit(onSubmitEnhance)} className="space-y-4">
                <FormField
                  control={enhanceForm.control}
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
                  control={enhanceForm.control}
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
                  <Button type="button" variant="outline" onClick={() => setIsEnhanceDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={enhanceNotesMutation.isPending}>
                    {enhanceNotesMutation.isPending ? (
                      <>
                        <span className="material-icons animate-spin mr-2">refresh</span>
                        Enhancing...
                      </>
                    ) : 'Enhance Notes'}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Enhanced Notes:</h3>
                <div className="p-4 border rounded-md bg-neutral-50 dark:bg-neutral-700/30 max-h-[300px] overflow-y-auto">
                  <p style={{ whiteSpace: 'pre-line' }}>{enhancedResult.enhancedNotes}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Key Concepts:</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancedResult.keyConcepts.map((concept, index) => (
                    <Badge key={index} variant="secondary">{concept}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEnhancedResult(null);
                    enhanceForm.reset({
                      notes: "",
                      subject: "",
                    });
                  }}
                >
                  Start Over
                </Button>
                <Button 
                  onClick={() => {
                    // Create new note from enhanced content
                    form.setValue("title", `Enhanced Notes: ${enhanceForm.getValues().subject}`);
                    form.setValue("content", enhancedResult.enhancedNotes);
                    form.setValue("subject", enhanceForm.getValues().subject);
                    form.setValue("tags", enhancedResult.keyConcepts.join(", "));
                    
                    setEnhancedResult(null);
                    setIsEnhanceDialogOpen(false);
                    setIsNewNoteDialogOpen(true);
                  }}
                >
                  Save as New Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classroom;
