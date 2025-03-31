import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StudySession } from "@/lib/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

const AddSessionDialog = ({ onSessionAdded }: { onSessionAdded: () => void }) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: Omit<StudySession, 'id' | 'userId'>) => {
      const res = await apiRequest('POST', '/api/study-sessions', sessionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      setOpen(false);
      resetForm();
      onSessionAdded();
      toast({
        title: "Study session created",
        description: "Your study session has been added to your schedule.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating study session",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setSubject("");
    setDescription("");
    setLocation("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSessionMutation.mutate({
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      subject,
      description,
      location,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-primary dark:text-primary-light p-1 rounded-full hover:bg-primary-light/10">
          <span className="material-icons">add</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Study Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter session title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E.g., Computer Science, AI Ethics"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="E.g., Library, Room 101"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter session description"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSessionMutation.isPending || !title || !startTime}
            >
              {createSessionMutation.isPending ? "Adding..." : "Add Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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

  const handleSessionAdded = () => {
    // This function is called after a new session is successfully added
    // We're already invalidating the query in the mutation, so no need to do anything else here
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Today's Schedule</h2>
        <div className="flex items-center space-x-2">
          <AddSessionDialog onSessionAdded={handleSessionAdded} />
          <button className="text-primary dark:text-primary-light flex items-center text-sm">
            <span>View all</span>
            <span className="material-icons text-sm ml-1">chevron_right</span>
          </button>
        </div>
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
