import { useQuery } from "@tanstack/react-query";
import { StudySession } from "@/lib/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type ScheduleItemProps = {
  time: string;
  title: string;
  location: string;
  borderColor: string;
  onOpenMenu?: () => void;
};

const ScheduleItem = ({ time, title, location, borderColor, onOpenMenu }: ScheduleItemProps) => (
  <div className={`flex items-start p-3 rounded-md bg-neutral-50 dark:bg-neutral-700/30 border-l-4 ${borderColor}`}>
    <div className="mr-3 text-neutral-500 dark:text-neutral-400 min-w-[60px] text-sm">
      <p>{time}</p>
    </div>
    <div className="flex-1">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{location}</p>
    </div>
    <div className="flex">
      <button 
        className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light"
        onClick={onOpenMenu}
      >
        <span className="material-icons text-sm">more_vert</span>
      </button>
    </div>
  </div>
);

const ScheduleItemSkeleton = () => (
  <div className="flex items-start p-3 rounded-md bg-neutral-50 dark:bg-neutral-700/30 border-l-4 border-neutral-300 dark:border-neutral-600">
    <div className="mr-3 min-w-[60px]">
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex-1">
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

const TodaySchedule = () => {
  const { data: studySessions, isLoading } = useQuery<StudySession[]>({
    queryKey: ['/api/study-sessions'],
  });

  // Filter for today's sessions and sort by start time
  const todaySessions = studySessions
    ? studySessions
        .filter(session => {
          const sessionDate = new Date(session.startTime);
          const today = new Date();
          return (
            sessionDate.getDate() === today.getDate() &&
            sessionDate.getMonth() === today.getMonth() &&
            sessionDate.getFullYear() === today.getFullYear()
          );
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    : [];

  // Function to get border color based on subject
  const getBorderColor = (subject: string): string => {
    switch (subject?.toLowerCase()) {
      case 'computer science':
        return 'border-primary';
      case 'ai ethics':
        return 'border-accent';
      default:
        return 'border-secondary';
    }
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Today's Schedule</h2>
        <button className="text-primary dark:text-primary-light flex items-center text-sm">
          <span>View all</span>
          <span className="material-icons text-sm ml-1">chevron_right</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <>
            <ScheduleItemSkeleton />
            <ScheduleItemSkeleton />
            <ScheduleItemSkeleton />
          </>
        ) : todaySessions.length > 0 ? (
          todaySessions.map((session) => (
            <ScheduleItem
              key={session.id}
              time={format(new Date(session.startTime), 'hh:mm a')}
              title={session.title}
              location={session.location || 'No location specified'}
              borderColor={getBorderColor(session.subject || '')}
              onOpenMenu={() => {}}
            />
          ))
        ) : (
          <p className="text-center py-6 text-neutral-500 dark:text-neutral-400">
            No study sessions scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
