import React from "react";
import { formatPercentage } from "@/lib/utils";

interface ProgressItemProps {
  title: string;
  icon: string;
  progress: number;
  completed: number;
  total: number;
  unit: string;
  color: string;
}

const ProgressItem: React.FC<ProgressItemProps> = ({
  title,
  icon,
  progress,
  completed,
  total,
  unit,
  color,
}) => {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
      <div className="flex items-center mb-2">
        <span className={`material-icons ${color} mr-2`}>{icon}</span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="mb-2 flex justify-between items-center">
        <span>Progress</span>
        <span className="font-medium">{formatPercentage(progress)}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color.includes('success') ? 'bg-[#4caf50]' : 
                      color.includes('secondary') ? 'bg-[#f50057]' : 
                      'bg-primary-DEFAULT'} animate-progress`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-3 text-sm text-text-light-secondary dark:text-text-dark-secondary">
        <span>{completed}</span> of <span>{total}</span> {unit} completed
      </div>
    </div>
  );
};

interface ProgressOverviewProps {
  weeklyGoals: {
    progress: number;
    completed: number;
    total: number;
  };
  tasksCompleted: {
    progress: number;
    completed: number;
    total: number;
  };
  quizPerformance: {
    avgScore: number;
    quizzesTaken: number;
  };
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  weeklyGoals,
  tasksCompleted,
  quizPerformance,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ProgressItem
        title="Weekly Goals"
        icon="trending_up"
        progress={weeklyGoals.progress}
        completed={weeklyGoals.completed}
        total={weeklyGoals.total}
        unit="study hours"
        color="text-primary-DEFAULT dark:text-primary-light"
      />
      <ProgressItem
        title="Tasks Completed"
        icon="task_alt"
        progress={tasksCompleted.progress}
        completed={tasksCompleted.completed}
        total={tasksCompleted.total}
        unit="tasks"
        color="text-[#f50057] dark:text-secondary-light"
      />
      <ProgressItem
        title="Quiz Performance"
        icon="auto_graph"
        progress={quizPerformance.avgScore}
        completed={quizPerformance.quizzesTaken}
        total={quizPerformance.quizzesTaken}
        unit="quizzes taken"
        color="text-[#4caf50]"
      />
    </div>
  );
};

export default ProgressOverview;
