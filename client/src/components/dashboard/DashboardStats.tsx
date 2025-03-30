import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StudyProgress } from "@/lib/types";

type StatProps = {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  isLoading?: boolean;
};

const StatItem = ({ icon, iconBgColor, iconColor, label, value, isLoading = false }: StatProps) => (
  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 flex items-center">
    <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor} mr-4`}>
      <span className="material-icons">{icon}</span>
    </div>
    <div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      {isLoading ? (
        <Skeleton className="h-6 w-20 mt-1" />
      ) : (
        <p className="text-xl font-bold">{value}</p>
      )}
    </div>
  </div>
);

const DashboardStats = () => {
  // Fetch study progress data
  const { data: progressData, isLoading: isProgressLoading } = useQuery<StudyProgress[]>({
    queryKey: ['/api/study-progress'],
  });

  // Fetch tasks data
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Fetch flashcard sets data
  const { data: flashcardSets, isLoading: isFlashcardsLoading } = useQuery({
    queryKey: ['/api/flashcard-sets'],
  });

  // Calculate total study time in hours
  const totalStudyTime = progressData 
    ? (progressData.reduce((acc, curr) => acc + curr.studyDuration, 0) / 60).toFixed(1)
    : 0;

  // Count completed and total tasks
  const completedTasks = tasksData ? tasksData.filter(task => task.completed).length : 0;
  const totalTasks = tasksData ? tasksData.length : 0;
  const tasksRatio = `${completedTasks}/${totalTasks}`;

  // Count flashcards (for demo purposes, use 86 if data isn't available)
  const flashcardCount = 86; // This would be calculated from actual flashcard data

  // Calculate streak in days (for demo purposes, use 7 if data isn't available)
  const streakDays = 7; // This would be calculated from actual progress data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatItem 
        icon="timer"
        iconBgColor="bg-primary-light/10"
        iconColor="text-primary dark:text-primary-light"
        label="Study Time"
        value={`${totalStudyTime} hours`}
        isLoading={isProgressLoading}
      />
      
      <StatItem 
        icon="task_alt"
        iconBgColor="bg-secondary-light/10"
        iconColor="text-secondary dark:text-secondary-light"
        label="Tasks Completed"
        value={tasksRatio}
        isLoading={isTasksLoading}
      />
      
      <StatItem 
        icon="flash_on"
        iconBgColor="bg-accent-light/10"
        iconColor="text-accent dark:text-accent-light"
        label="Flashcards Reviewed"
        value={flashcardCount}
        isLoading={isFlashcardsLoading}
      />
      
      <StatItem 
        icon="emoji_events"
        iconBgColor="bg-success/10"
        iconColor="text-success"
        label="Streak"
        value={`${streakDays} days`}
        isLoading={isProgressLoading}
      />
    </div>
  );
};

export default DashboardStats;
