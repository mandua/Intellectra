import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Get priority border color
const getPriorityBorderColor = (priority: number): string => {
  switch (priority) {
    case 1: return 'border-error';  // High priority
    case 2: return 'border-warning'; // Medium priority
    case 3: return 'border-secondary'; // Low priority
    default: return 'border-primary';
  }
};

// Format the due date for display
const formatDueDate = (dueDate: string | Date): string => {
  const date = new Date(dueDate);
  
  if (isToday(date)) {
    return 'Due Today';
  }
  
  const tomorrow = addDays(new Date(), 1);
  if (isToday(tomorrow) && date.getDate() === tomorrow.getDate()) {
    return 'Due Tomorrow';
  }
  
  const daysLeft = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return `Due in ${daysLeft} days`;
};

const PriorityTasks = () => {
  const { toast } = useToast();
  
  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Update task mutation (for toggling completion)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const res = await apiRequest('PUT', `/api/tasks/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter for incomplete tasks and sort by priority
  const priorityTasks = tasks
    ? tasks
        .filter(task => !task.completed)
        .sort((a, b) => {
          // First by priority
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // Then by due date
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
        })
        .slice(0, 4) // Show only top 4 tasks
    : [];
  
  // Handle checkbox toggle
  const handleTaskToggle = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed: !completed });
  };
  
  const TaskItemSkeleton = () => (
    <div className="flex items-center p-3 rounded-md bg-neutral-50 dark:bg-neutral-700/30 border-l-4 border-neutral-300">
      <div className="mr-3 h-5 w-5">
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Priority Tasks</h2>
        <button className="text-primary dark:text-primary-light p-1 rounded-full hover:bg-primary-light/10">
          <span className="material-icons">add</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <>
            <TaskItemSkeleton />
            <TaskItemSkeleton />
            <TaskItemSkeleton />
            <TaskItemSkeleton />
          </>
        ) : priorityTasks.length > 0 ? (
          priorityTasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center p-3 rounded-md bg-neutral-50 dark:bg-neutral-700/30 border-l-4 ${getPriorityBorderColor(task.priority)}`}
            >
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => handleTaskToggle(task.id, task.completed)}
                className="mr-3 h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary" 
              />
              <div className="flex-1">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {task.dueDate ? formatDueDate(task.dueDate) : 'No due date'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-6 text-neutral-500 dark:text-neutral-400">
            No pending tasks. Add new tasks to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default PriorityTasks;
