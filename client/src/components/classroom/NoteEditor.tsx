import React, { useState, useEffect } from "react";
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
import { insertNotesSchema } from "@shared/schema";

// Extended schema for form validation
const noteFormSchema = insertNotesSchema.extend({
  subject: z.string().min(1, "Subject is required"),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface NoteEditorProps {
  note: any;
  onSave: (note: NoteFormValues) => void;
  isLoading: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  isLoading,
}) => {
  const [wordCount, setWordCount] = useState(0);

  // Setup form with default values
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      subject: note?.subject || "",
      userId: 1, // Demo user ID
    },
  });

  // Update form values when note changes
  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title || "",
        content: note.content || "",
        subject: note.subject || "",
        userId: 1,
      });
    } else {
      form.reset({
        title: "",
        content: "",
        subject: "",
        userId: 1,
      });
    }
  }, [note, form]);

  // Update word count when content changes
  useEffect(() => {
    const content = form.watch("content");
    if (content) {
      const words = content.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [form.watch("content")]);

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

  const handleSubmit = (values: NoteFormValues) => {
    onSave({
      ...values,
      keyPoints: note?.keyPoints || [] // Preserve key points if any
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter note title" {...field} />
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
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your notes here..."
                  className="min-h-[300px] font-mono"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                <span>
                  Supports Markdown formatting
                </span>
                <span>{wordCount} words</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <span className="material-icons animate-spin mr-2">
                autorenew
              </span>
            )}
            {note ? "Update Note" : "Save Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NoteEditor;
