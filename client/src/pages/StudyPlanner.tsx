import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, StudySession } from "@/lib/types";
import { format, parseISO, isValid, addHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for new task form
const newTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().refine(val => {
    const date = new Date(val);
    return isValid(date) && date > new Date();
  }, "Due date must be in the future"),
  priority: z.string().transform(val => parseInt(val)),
  category: z.string().min(1, "Category is required"),
});

// Schema for new study session form
const newSessionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  startTime: z.string().refine(val => {
    const date = new Date(val);
    return isValid(date);
  }, "Start time is required"),
  endTime: z.string().refine(val => {
    const date = new Date(val);
    return isValid(date);
  }, "End time is required"),
  subject: z.string().min(1, "Subject is required"),
  location: z.string().optional(),
});

const StudyPlanner = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  // Fetch tasks
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch study sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<StudySession[]>({
    queryKey: ['/api/study-sessions'],
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: z.infer<typeof newTaskSchema>) => {
      const res = await apiRequest('POST', '/api/tasks', taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task created successfully!" });
      setIsTaskDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create study session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: z.infer<typeof newSessionSchema>) => {
      const res = await apiRequest('POST', '/api/study-sessions', sessionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      toast({ title: "Study session created successfully!" });
      setIsSessionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create study session",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Set up form for new task
  const taskForm = useForm<z.infer<typeof newTaskSchema>>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : "",
      priority: "2", // Medium priority by default
      category: "",
    },
  });
  
  // Set up form for new study session
  const sessionForm = useForm<z.infer<typeof newSessionSchema>>({
    resolver: zodResolver(newSessionSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : "",
      endTime: selectedDate ? format(addHours(selectedDate, 1), "yyyy-MM-dd'T'HH:mm") : "",
      subject: "",
      location: "",
    },
  });
  
  // Filter content for selected date
  const filteredTasks = tasks?.filter(task => {
    if (!selectedDate || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  }) || [];
  
  const filteredSessions = sessions?.filter(session => {
    if (!selectedDate || !session.startTime) return false;
    const sessionDate = new Date(session.startTime);
    return (
      sessionDate.getDate() === selectedDate.getDate() &&
      sessionDate.getMonth() === selectedDate.getMonth() &&
      sessionDate.getFullYear() === selectedDate.getFullYear()
    );
  }) || [];
  
  // Handle task submission
  const onSubmitTask = (values: z.infer<typeof newTaskSchema>) => {
    createTaskMutation.mutate(values);
  };
  
  // Handle session submission
  const onSubmitSession = (values: z.infer<typeof newSessionSchema>) => {
    createSessionMutation.mutate(values);
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Study Planner</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Organize your study schedule and tasks</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold mb-4">Calendar</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setIsTaskDialogOpen(true)} className="flex-1">
              <span className="material-icons mr-1 text-sm">add_task</span>
              Add Task
            </Button>
            <Button onClick={() => setIsSessionDialogOpen(true)} className="flex-1">
              <span className="material-icons mr-1 text-sm">event</span>
              Add Session
            </Button>
          </div>
        </div>
        
        {/* Schedule & Tasks */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Select a date"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSessions ? (
                    <p>Loading schedule...</p>
                  ) : filteredSessions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredSessions
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        .map(session => (
                          <div 
                            key={session.id} 
                            className="flex items-start p-3 rounded-md bg-neutral-50 dark:bg-neutral-700/30 border-l-4 border-primary"
                          >
                            <div className="mr-3 text-neutral-500 dark:text-neutral-400 min-w-[80px] text-sm">
                              {format(new Date(session.startTime), "h:mm a")}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{session.title}</p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {session.location || "No location"} | {session.subject}
                              </p>
                              {session.description && (
                                <p className="text-sm mt-1">{session.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                      No study sessions scheduled for this day.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Tasks due on {selectedDate ? format(selectedDate, "MMMM do") : "selected date"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTasks ? (
                    <p>Loading tasks...</p>
                  ) : filteredTasks.length > 0 ? (
                    <div className="space-y-3">
                      {filteredTasks
                        .sort((a, b) => a.priority - b.priority)
                        .map(task => (
                          <div 
                            key={task.id} 
                            className={`flex items-start p-3 rounded-md bg-neutral-50 dark:bg-neutral-700/30 border-l-4 ${
                              task.priority === 1 ? 'border-error' :
                              task.priority === 2 ? 'border-warning' :
                              'border-secondary'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={task.completed}
                              className="mr-3 h-5 w-5 mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary" 
                            />
                            <div className="flex-1">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Priority: {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'} | 
                                Category: {task.category}
                              </p>
                              {task.description && (
                                <p className="text-sm mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                      No tasks due on this day.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* New Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onSubmitTask)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">High</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Homework, Project, Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? 'Saving...' : 'Save Task'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* New Study Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Study Session</DialogTitle>
          </DialogHeader>
          
          <Form {...sessionForm}>
            <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-4">
              <FormField
                control={sessionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Session title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={sessionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={sessionForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={sessionForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={sessionForm.control}
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
                control={sessionForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Library, Room 301" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSessionDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createSessionMutation.isPending}>
                  {createSessionMutation.isPending ? 'Saving...' : 'Save Session'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyPlanner;
