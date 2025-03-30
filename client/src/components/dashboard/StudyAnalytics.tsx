import React, { useEffect } from "react";
import { getTimeBlockLabel } from "@/lib/utils";

interface TopSubject {
  name: string;
  progress: number;
}

interface StudyAnalyticsProps {
  productivityData: number[];
  topSubjects: TopSubject[];
}

const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  productivityData,
  topSubjects,
}) => {
  // Animate chart bars on load
  useEffect(() => {
    const chartBars = document.querySelectorAll('[class^="chart-bar-"]');
    setTimeout(() => {
      chartBars.forEach((bar, index) => {
        const height = `${productivityData[index]}%`;
        (bar as HTMLElement).style.height = height;
      });
    }, 300);
  }, [productivityData]);

  // Find the max value to highlight
  const maxValue = Math.max(...productivityData);

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
      <h3 className="text-xl font-medium mb-4">Study Analytics</h3>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-light-secondary dark:text-text-dark-secondary">
              Productivity by Time
            </span>
          </div>
          <div className="h-40 flex items-end space-x-2">
            {productivityData.map((height, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1"
              >
                <div 
                  className={`w-full rounded-t transition-all duration-500 ease-in-out chart-bar-${index+1} ${
                    height === maxValue 
                      ? "bg-primary-DEFAULT" 
                      : "bg-primary-light/30 dark:bg-primary-light/20"
                  }`} 
                  style={{ height: "0%" }} // Initial height, will be animated
                ></div>
                <span className="text-xs mt-1 text-text-light-secondary dark:text-text-dark-secondary">
                  {getTimeBlockLabel(index)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <h4 className="font-medium mb-2">Top Productive Subjects</h4>
          <div className="space-y-2">
            {topSubjects.map((subject, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span>{subject.name}</span>
                  <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                    {subject.progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-DEFAULT animate-progress"
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyAnalytics;
