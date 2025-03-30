import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type Recommendation = {
  title: string;
  description: string;
  type: "AI Suggested" | "Pomodoro" | "Resource" | "Quiz" | "Review";
  icon: string;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "AI Suggested": 
      return {
        bg: "bg-primary/10",
        text: "text-primary dark:text-primary-light",
        iconBg: "bg-primary-light/10",
        iconText: "text-primary dark:text-primary-light"
      };
    case "Pomodoro": 
      return {
        bg: "bg-secondary/10",
        text: "text-secondary dark:text-secondary-light",
        iconBg: "bg-secondary-light/10",
        iconText: "text-secondary dark:text-secondary-light"
      };
    case "Resource": 
      return {
        bg: "bg-accent/10",
        text: "text-accent dark:text-accent-light",
        iconBg: "bg-accent-light/10",
        iconText: "text-accent dark:text-accent-light"
      };
    case "Quiz":
      return {
        bg: "bg-success/10",
        text: "text-success",
        iconBg: "bg-success/10",
        iconText: "text-success"
      };
    case "Review":
      return {
        bg: "bg-warning/10",
        text: "text-warning",
        iconBg: "bg-warning/10",
        iconText: "text-warning"
      };
    default:
      return {
        bg: "bg-neutral-200/10",
        text: "text-neutral-600 dark:text-neutral-400",
        iconBg: "bg-neutral-200",
        iconText: "text-neutral-600 dark:text-neutral-400"
      };
  }
};

const RecommendationSkeleton = () => (
  <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <Skeleton className="h-6 w-3/4 mb-1" />
    <Skeleton className="h-4 w-full mb-3" />
    <Skeleton className="h-5 w-28" />
  </div>
);

const AIRecommendations = () => {
  // Fetch AI recommendations
  const { data: recommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
  });

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">AI Study Recommendations</h2>
        <button className="text-primary dark:text-primary-light p-1 rounded-full hover:bg-primary-light/10">
          <span className="material-icons">refresh</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <RecommendationSkeleton />
            <RecommendationSkeleton />
            <RecommendationSkeleton />
          </>
        ) : recommendations && recommendations.length > 0 ? (
          recommendations.map((rec, index) => {
            const colors = getTypeColor(rec.type);
            
            return (
              <div key={index} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-10 h-10 rounded-full ${colors.iconBg} flex items-center justify-center ${colors.iconText}`}>
                    <span className="material-icons">{rec.icon}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>{rec.type}</span>
                </div>
                <h3 className="font-medium mb-1">{rec.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{rec.description}</p>
                <button className={`text-sm ${colors.text} font-medium`}>
                  {rec.type === "AI Suggested" ? "Add to planner" :
                   rec.type === "Pomodoro" ? "Start session" :
                   rec.type === "Resource" ? "View resource" :
                   rec.type === "Quiz" ? "Start quiz" :
                   "Begin review"}
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-4 col-span-3 text-center text-neutral-500 dark:text-neutral-400">
            No recommendations available. Try refreshing or adding more study data.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
