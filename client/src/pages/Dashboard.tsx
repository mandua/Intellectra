import { useUser } from "@/context/UserContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import PriorityTasks from "@/components/dashboard/PriorityTasks";
import Flashcards from "@/components/dashboard/Flashcards";
import StudyAnalytics from "@/components/dashboard/StudyAnalytics";
import AIRecommendations from "@/components/dashboard/AIRecommendations";

const Dashboard = () => {
  const { user, isLoading } = useUser();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {isLoading ? "Welcome back" : `Welcome back, ${user?.name?.split(' ')[0] || 'Student'}`}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">Here's your study progress this week</p>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Today's Schedule & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TodaySchedule />
        <PriorityTasks />
      </div>

      {/* Recent Flashcards & Study Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Flashcards />
        <StudyAnalytics />
      </div>

      {/* AI Study Recommendations */}
      <AIRecommendations />
    </div>
  );
};

export default Dashboard;
