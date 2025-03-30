import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { enhanceNotes } from "@/lib/ai";
import NotesList from "@/components/classroom/NotesList";
import NoteEditor from "@/components/classroom/NoteEditor";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ClassroomCompanion = () => {
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['/api/notes'],
  });

  // Fetch selected note (if any)
  const { data: noteDetails, isLoading: isLoadingNoteDetails } = useQuery({
    queryKey: ['/api/notes', selectedNote?.id],
    queryFn: async () => {
      if (!selectedNote?.id) return null;
      const res = await fetch(`/api/notes/${selectedNote.id}`);
      if (!res.ok) throw new Error("Failed to fetch note details");
      return res.json();
    },
    enabled: !!selectedNote?.id
  });

  // Create note mutation
  const { mutate: createNote, isPending: isCreatingNoteMutation } = useMutation({
    mutationFn: async (note: any) => {
      return apiRequest("POST", "/api/notes", note);
    },
    onSuccess: (response) => {
      response.json().then(newNote => {
        queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
        setSelectedNote(newNote);
        setIsCreatingNote(false);
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update note mutation
  const { mutate: updateNote, isPending: isUpdatingNote } = useMutation({
    mutationFn: async ({ id, ...note }: any) => {
      return apiRequest("PATCH", `/api/notes/${id}`, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes', selectedNote?.id] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete note mutation
  const { mutate: deleteNote } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setSelectedNote(null);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // AI enhance notes mutation
  const { mutate: enhanceNoteWithAI, isPending: isEnhancingNote } = useMutation({
    mutationFn: async (content: string) => {
      return enhanceNotes(content);
    },
    onSuccess: (enhancedData) => {
      if (selectedNote) {
        updateNote({
          id: selectedNote.id,
          content: enhancedData.enhancedContent,
          keyPoints: enhancedData.keyPoints
        });
      }
      toast({
        title: "Success",
        description: "Note enhanced with AI assistance",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to enhance note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCreateNote = (note: any) => {
    createNote({
      ...note,
      userId: 1, // Demo user ID
      keyPoints: []
    });
  };

  const handleUpdateNote = (note: any) => {
    updateNote({
      ...note,
      id: selectedNote.id
    });
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
    }
  };

  const handleEnhanceNote = () => {
    if (noteDetails?.content) {
      enhanceNoteWithAI(noteDetails.content);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">Study Notes</h3>
          <Button onClick={() => {
            setSelectedNote(null);
            setIsCreatingNote(true);
          }}>
            <span className="material-icons mr-2">add</span>
            New Note
          </Button>
        </div>

        <NotesList
          notes={notes || []}
          selectedNoteId={selectedNote?.id}
          isLoading={isLoadingNotes}
          onNoteSelect={(note) => {
            setSelectedNote(note);
            setIsCreatingNote(false);
          }}
        />
      </div>

      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="notes">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {selectedNote && !isCreatingNote && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnhanceNote}
                  disabled={isEnhancingNote}
                >
                  {isEnhancingNote ? (
                    <span className="material-icons animate-spin mr-2">autorenew</span>
                  ) : (
                    <span className="material-icons mr-2">psychology</span>
                  )}
                  Enhance with AI
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteNote}
                >
                  <span className="material-icons mr-2">delete</span>
                  Delete
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="notes">
            {isLoadingNoteDetails && selectedNote ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <NoteEditor
                note={isCreatingNote ? null : noteDetails}
                onSave={isCreatingNote ? handleCreateNote : handleUpdateNote}
                isLoading={isCreatingNoteMutation || isUpdatingNote}
              />
            )}
          </TabsContent>

          <TabsContent value="preview">
            {selectedNote && noteDetails ? (
              <div className="border border-border rounded-lg p-6 bg-white dark:bg-[#1e1e1e]">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-2">{noteDetails.title}</h2>
                  <div className="flex items-center text-sm text-text-light-secondary dark:text-text-dark-secondary mb-4">
                    <span className="mr-4">
                      <span className="material-icons text-sm mr-1 align-text-bottom">category</span>
                      {noteDetails.subject}
                    </span>
                    <span>
                      <span className="material-icons text-sm mr-1 align-text-bottom">schedule</span>
                      {new Date(noteDetails.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {noteDetails.keyPoints && noteDetails.keyPoints.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Key Points:</h3>
                      <div className="flex flex-wrap gap-2">
                        {noteDetails.keyPoints.map((point: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-primary-light/10 dark:bg-primary-dark/10">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {noteDetails.content.split('\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Note Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary">
                    Select a note to preview or create a new one.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassroomCompanion;
