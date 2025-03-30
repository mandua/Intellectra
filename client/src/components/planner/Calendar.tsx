import React from "react";
import { Button } from "@/components/ui/button";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

interface CalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  setSelectedDate,
  tasks,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(
    startOfWeek(selectedDate, { weekStartsOn: 1 })
  );

  // Get the days of the current week
  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  // Navigate to previous week
  const prevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Navigate to next week
  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Reset to current week
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  // Get task count for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            onClick={goToToday}
            variant="outline"
            size="sm"
            className="text-primary-DEFAULT dark:text-primary-light"
          >
            Today
          </Button>
        </div>
        <div className="text-lg font-medium">
          {format(currentWeekStart, "MMMM yyyy")}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <span className="material-icons">chevron_left</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <span className="material-icons">chevron_right</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {daysOfWeek.map((day) => (
          <div key={`header-${day.toString()}`} className="text-center py-2">
            <span className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">
              {format(day, "EEE")}
            </span>
          </div>
        ))}

        {/* Calendar days */}
        {daysOfWeek.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={`rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "border-primary-DEFAULT dark:border-primary-light bg-primary-light/5 dark:bg-primary-dark/10"
                  : isDayToday 
                    ? "border-primary-light/50 dark:border-primary-dark/50" 
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="p-2 h-24 flex flex-col">
                <div
                  className={`self-center h-6 w-6 rounded-full flex items-center justify-center mb-1 ${
                    isDayToday
                      ? "bg-primary-DEFAULT text-white"
                      : ""
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDayToday
                        ? ""
                        : "text-text-light-primary dark:text-text-dark-primary"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                  {dayTasks.length > 0 ? (
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`px-1 py-0.5 text-xs rounded truncate ${
                            task.completed
                              ? "line-through text-text-light-secondary dark:text-text-dark-secondary"
                              : task.priority === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : task.priority === "medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-center text-text-light-secondary dark:text-text-dark-secondary">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-center text-text-light-secondary dark:text-text-dark-secondary h-full flex items-center justify-center">
                      <span className="opacity-50">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
