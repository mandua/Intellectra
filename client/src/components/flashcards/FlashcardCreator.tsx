import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertFlashcardDeckSchema, insertFlashcardSchema } from "@shared/schema";

// Create deck schema
const deckFormSchema = insertFlashcardDeckSchema.extend({
  subject: z.string().min(1, "Subject is required"),
});

type DeckFormValues = z.infer<typeof deckFormSchema>;

// Create flashcard schema
const flashcardFormSchema = insertFlashcardSchema.extend({});

type FlashcardFormValues = z.infer<typeof flashcardFormSchema>;

interface FlashcardCreatorProps {
  deckId?: number;
  onCreateDeck?: (deck: DeckFormValues) => void;
  onAddFlashcard?: (flashcard: FlashcardFormValues) => void;
  onCancel?: () => void;
  isCreating: boolean;
}

const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({
  deckId,
  onCreateDeck,
  onAddFlashcard,
  onCancel,
  isCreating,
}) => {
  const isCreatingDeck = !deckId && onCreateDeck;

  const subjects = [
    "Mathematics",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "History",
    "Languages",
    "Art",
    "Economics",
    "Psychology",
    "Other",
  ];

  // Deck creation form
  const deckForm = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      userId: 1, // Demo user ID
    },
  });

  // Flashcard creation form
  const flashcardForm = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: "",
      back: "",
      deckId: deckId || 0,
    },
  });

  const handleDeckSubmit = (values: DeckFormValues) => {
    if (onCreateDeck) {
      onCreateDeck(values);
    }
  };

  const handleFlashcardSubmit = (values: FlashcardFormValues) => {
    if (onAddFlashcard) {
      onAddFlashcard({
        ...values,
        deckId: deckId || 0,
      });
      flashcardForm.reset({
        front: "",
        back: "",
        deckId: deckId || 0,
      });
    }
  };

  if (isCreatingDeck) {
    return (
      <Form {...deckForm}>
        <form onSubmit={deckForm.handleSubmit(handleDeckSubmit)} className="space-y-4">
          <FormField
            control={deckForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deck Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter deck title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={deckForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter deck description"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={deckForm.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isCreating}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isCreating}>
              {isCreating && (
                <span className="material-icons mr-2 animate-spin">
                  autorenew
                </span>
              )}
              Create Deck
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...flashcardForm}>
      <form onSubmit={flashcardForm.handleSubmit(handleFlashcardSubmit)} className="space-y-4">
        <FormField
          control={flashcardForm.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Front (Question)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the question or prompt"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={flashcardForm.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Back (Answer)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the answer or explanation"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="submit" disabled={isCreating}>
            {isCreating && (
              <span className="material-icons mr-2 animate-spin">
                autorenew
              </span>
            )}
            Add Flashcard
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FlashcardCreator;
