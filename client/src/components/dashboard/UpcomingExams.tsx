import React from "react";
import { formatDate, getDaysUntil, getDaysUntilText } from "@/lib/utils";

interface Exam {
  id: number;
  title: string;
  subject: string;
  date: string;
  description: string;
}

interface UpcomingExamsProps {
  exams: Exam[];
  onCreateStudyPlan: (examId: number) => void;
}

const UpcomingExams: React.FC<UpcomingExamsProps> = ({
  exams,
  onCreateStudyPlan,
}) => {
  return (
    <div className="md:col-span-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
      <h3 className="text-xl font-medium mb-4">Upcoming Exams</h3>

      <div className="space-y-4">
        {exams.length > 0 ? (
          exams.map((exam) => {
            const { text: daysText, isUrgent } = getDaysUntilText(exam.date);
            const borderColor = isUrgent
              ? "border-[#ff9800]"
              : "border-gray-300 dark:border-gray-600";
            const badgeColor = isUrgent
              ? "bg-[#ff9800]/10 text-[#ff9800]"
              : "bg-gray-100 dark:bg-gray-700 text-text-light-secondary dark:text-text-dark-secondary";

            return (
              <div key={exam.id} className={`border-l-4 ${borderColor} pl-3 py-1`}>
                <h4 className="font-medium">{exam.title}</h4>
                <div className="flex items-center text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
                  <span className="material-icons text-sm mr-1">event</span>
                  <span>{formatDate(exam.date)}</span>
                  <span className="mx-2">•</span>
                  <span className={`${badgeColor} px-2 py-0.5 rounded text-xs`}>
                    {daysText}
                  </span>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => onCreateStudyPlan(exam.id)}
                    className="text-sm text-primary-DEFAULT dark:text-primary-light hover:underline"
                  >
                    Create study plan
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary">
            <span className="material-icons text-4xl mb-2">event_available</span>
            <p>No upcoming exams</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingExams;
