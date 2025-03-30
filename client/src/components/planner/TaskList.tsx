import React from "react";
import { 
  formatDate, 
  formatTime, 
  formatDuration, 
  getPriorityClasses 
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  startTime: string;
  duration: number;
  completed: boolean;
  priority: string;
  subject: string;
}

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskComplete: (id: number, completed: boolean) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="mr-4 w-[60px]">
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="flex-grow">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="ml-4">
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary">
        <span className="material-icons text-4xl mb-2">event_busy</span>
        <p>No tasks for this day</p>
        <p className="text-sm">Add a task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-start p-3 rounded-lg border ${
            task.completed
              ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
              : "border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/10"
          }`}
        >
          <div className="mr-4 flex items-center justify-center">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => onTaskComplete(task.id, Boolean(checked))}
              className="mt-1"
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center flex-wrap gap-2">
              <h4 className={`font-medium ${task.completed ? "line-through text-text-light-secondary dark:text-text-dark-secondary" : ""}`}>
                {task.title}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClasses(task.priority)}`}>
                {task.priority}
              </span>
              {task.subject && (
                <span className="text-xs bg-primary-light/10 dark:bg-primary-light/20 text-primary-DEFAULT dark:text-primary-light px-2 py-0.5 rounded-full">
                  {task.subject}
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm mt-1">
                {task.description}
              </p>
            )}
            <div className="flex items-center mt-2 text-sm text-text-light-secondary dark:text-text-dark-secondary">
              <span className="material-icons text-sm mr-1">schedule</span>
              <span>{formatTime(task.startTime)}</span>
              <span className="mx-1">•</span>
              <span>{formatDuration(task.duration)}</span>
            </div>
          </div>
          <div className="ml-4 flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTaskEdit(task)}
              className="h-8 w-8"
            >
              <span className="material-icons text-text-light-secondary dark:text-text-dark-secondary">
                edit
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm("Are you sure you want to delete this task?")) {
                  onTaskDelete(task.id);
                }
              }}
              className="h-8 w-8"
            >
              <span className="material-icons text-red-500 dark:text-red-400">
                delete
              </span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
