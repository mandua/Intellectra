import { useQuery } from "@tanstack/react-query";
import { StudyProgress } from "@/lib/types";
import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type TimeRangeType = "week" | "month" | "semester";

const StudyAnalytics = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeType>("week");
  
  // Fetch study progress data
  const { data: progressData, isLoading } = useQuery<StudyProgress[]>({
    queryKey: ['/api/study-progress'],
  });
  
  // Calculate date range for current week
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  // Get array of days in the current week
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Group study time by day
  const studyTimeByDay = daysInWeek.map(day => {
    const dayStudyTime = progressData
      ? progressData
          .filter(progress => {
            const progressDate = new Date(progress.date);
            return (
              progressDate.getDate() === day.getDate() &&
              progressDate.getMonth() === day.getMonth() &&
              progressDate.getFullYear() === day.getFullYear()
            );
          })
          .reduce((total, progress) => total + progress.studyDuration, 0) / 60 // Convert to hours
      : 0;
    
    return {
      day: format(day, 'EEE'),
      hours: dayStudyTime
    };
  });
  
  // Find the most productive day
  const mostProductiveDay = studyTimeByDay.length > 0 
    ? studyTimeByDay.reduce((prev, current) => (prev.hours > current.hours) ? prev : current).day
    : "N/A";
  
  // Calculate focus score (demo value between 0 and 10)
  const focusScore = "8.2/10"; // This would be calculated from actual data
  
  // Calculate weekly goal progress (demo values)
  const weeklyGoalHours = 20;
  const totalWeeklyHours = studyTimeByDay.reduce((total, day) => total + day.hours, 0);
  const weeklyGoalProgress = `${Math.round(totalWeeklyHours)}h / ${weeklyGoalHours}h`;
  
  // Max height in the chart
  const maxHeight = Math.max(...studyTimeByDay.map(day => day.hours), 0.1) * 10;
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Study Analytics</h2>
        <select 
          className="text-sm rounded border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRangeType)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="semester">This Semester</option>
        </select>
      </div>
      
      <div className="h-48 mb-4">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-end justify-between px-2">
            {studyTimeByDay.map((day, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <div 
                  className={`w-8 rounded-t ${
                    day.hours > 0 
                      ? `bg-primary/${Math.min(70, Math.max(15, Math.round(day.hours * 10)))} dark:bg-primary/${Math.min(50, Math.max(10, Math.round(day.hours * 7)))}`
                      : "bg-primary/10 dark:bg-primary/5"
                  }`}
                  style={{
                    height: `${day.hours > 0 ? (day.hours / maxHeight) * 100 * 4 : 10}%`
                  }}
                ></div>
                <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">{day.day}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Most Productive Day</p>
          <p className="font-medium">{isLoading ? <Skeleton className="h-5 w-20" /> : mostProductiveDay}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Focus Score</p>
          <p className="font-medium">{isLoading ? <Skeleton className="h-5 w-16" /> : focusScore}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Weekly Goal</p>
          <p className="font-medium">{isLoading ? <Skeleton className="h-5 w-24" /> : weeklyGoalProgress}</p>
        </div>
      </div>
    </div>
  );
};

export default StudyAnalytics;
