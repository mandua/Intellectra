import React from "react";
import { formatDate, formatDuration } from "@/lib/utils";

interface ScheduleItem {
  id: number;
  title: string;
  description: string;
  time: string;
  duration: number;
  status: "in_progress" | "upcoming" | "completed";
}

interface TodayScheduleProps {
  date: Date;
  scheduleItems: ScheduleItem[];
  onViewFullSchedule: () => void;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({
  date,
  scheduleItems,
  onViewFullSchedule,
}) => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "in_progress":
        return "border-primary-DEFAULT bg-primary-light/5 dark:bg-primary-dark/10";
      case "completed":
        return "border-[#4caf50] bg-[#4caf50]/5 dark:bg-[#4caf50]/10";
      default:
        return "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-light/10 dark:bg-primary-light/20 text-primary-DEFAULT dark:text-primary-light">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#4caf50]/10 dark:bg-[#4caf50]/20 text-[#4caf50]">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-text-light-secondary dark:text-text-dark-secondary">
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium">Today's Schedule</h3>
        <span className="text-primary-DEFAULT dark:text-primary-light font-medium">
          {formatDate(date)}
        </span>
      </div>

      <div className="space-y-4">
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-start p-3 rounded-lg border-l-4 ${getStatusClasses(
                item.status
              )}`}
            >
              <div className="mr-4 w-20 text-center">
                <span className="block text-text-light-secondary dark:text-text-dark-secondary">
                  {item.time}
                </span>
                <span className="block text-sm">
                  {formatDuration(item.duration)}
                </span>
              </div>
              <div className="flex-grow">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                  {item.description}
                </p>
              </div>
              <div>{getStatusBadge(item.status)}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary">
            <span className="material-icons text-4xl mb-2">event_busy</span>
            <p>No tasks scheduled for today</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={onViewFullSchedule}
          className="text-primary-DEFAULT dark:text-primary-light font-medium flex items-center justify-end w-full md:w-auto"
        >
          <span>View Full Schedule</span>
          <span className="material-icons ml-1">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default TodaySchedule;
