import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Calendar from "@/components/planner/Calendar";
import TaskList from "@/components/planner/TaskList";
import TaskForm from "@/components/planner/TaskForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const StudyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format selected date to query parameter format
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  // Fetch all tasks
  const { data: allTasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Fetch tasks for selected date
  const { data: tasksForDate, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['/api/tasks/date', formattedDate],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/date/${formattedDate}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    }
  });

  // Create task mutation
  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: async (task: any) => {
      return apiRequest("POST", "/api/tasks", task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/date', formattedDate] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setIsAddTaskDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update task mutation
  const { mutate: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: async ({ id, ...task }: any) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/date', formattedDate] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      setEditingTask(null);
      setIsAddTaskDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete task mutation
  const { mutate: deleteTask } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/date', formattedDate] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Complete/incomplete task mutation
  const { mutate: toggleTaskCompletion } = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/date', formattedDate] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleAddTask = (task: any) => {
    // Convert due date string to ISO string
    const dueDate = new Date(task.dueDate);
    createTask({
      ...task,
      dueDate: dueDate.toISOString()
    });
  };

  const handleEditTask = (task: any) => {
    // Convert due date string to ISO string
    const dueDate = new Date(task.dueDate);
    updateTask({
      ...task,
      dueDate: dueDate.toISOString()
    });
  };

  const handleTaskSubmit = (values: any) => {
    if (editingTask) {
      handleEditTask({ ...values, id: editingTask.id });
    } else {
      handleAddTask(values);
    }
  };

  const openEditDialog = (task: any) => {
    // Format the date from ISO to YYYY-MM-DD for the form
    const formattedTask = {
      ...task,
      dueDate: task.dueDate.split('T')[0] // Extract just the date part
    };
    setEditingTask(formattedTask);
    setIsAddTaskDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-medium">Study Schedule</h2>
        <Button onClick={() => {
          setEditingTask(null);
          setIsAddTaskDialogOpen(true);
        }}>
          <span className="material-icons mr-2">add</span>
          Add Task
        </Button>
      </div>

      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        tasks={allTasks || []}
      />

      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">
            Tasks for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
        </div>

        <TaskList
          tasks={tasksForDate || []}
          isLoading={isLoadingTasks}
          onTaskComplete={(id, completed) => toggleTaskCompletion({ id, completed })}
          onTaskEdit={openEditDialog}
          onTaskDelete={(id) => deleteTask(id)}
        />
      </div>

      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            defaultValues={editingTask ? {
              ...editingTask,
              dueDate: editingTask.dueDate
            } : {
              dueDate: format(selectedDate, "yyyy-MM-dd")
            }}
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setIsAddTaskDialogOpen(false);
              setEditingTask(null);
            }}
            isSubmitting={isCreatingTask || isUpdatingTask}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyPlanner;
