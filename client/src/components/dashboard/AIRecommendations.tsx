import React from "react";
import { AIRecommendation } from "@/lib/ai";

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  onGenerateMore: () => void;
  isLoading: boolean;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onGenerateMore,
  isLoading,
}) => {
  const getIconColor = (type: string) => {
    switch (type) {
      case "productivity":
        return "text-primary-DEFAULT dark:text-primary-light";
      case "subject":
        return "text-[#ff9800]"; // warning
      case "collaboration":
        return "text-[#f50057] dark:text-secondary-light"; // secondary
      default:
        return "text-primary-DEFAULT dark:text-primary-light";
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm p-5">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-medium">AI Recommendations</h3>
        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-light/20 dark:bg-primary-light/10 text-primary-DEFAULT dark:text-primary-light rounded-full">
          Personalized
        </span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-primary-light border-t-primary-DEFAULT rounded-full animate-spin mb-4"></div>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">
              Generating recommendations...
            </p>
          </div>
        ) : recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-light dark:hover:border-primary-dark transition-colors"
            >
              <div className="flex items-start">
                <span className={`material-icons ${getIconColor(rec.type)} mr-3`}>
                  {rec.icon}
                </span>
                <div>
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary">
            <span className="material-icons text-4xl mb-2">psychology</span>
            <p>No recommendations available yet</p>
          </div>
        )}

        <button
          onClick={onGenerateMore}
          disabled={isLoading}
          className={`mt-2 w-full py-2 bg-primary-DEFAULT ${
            !isLoading ? "hover:bg-primary-light" : "opacity-70"
          } text-white rounded-lg transition-colors flex items-center justify-center`}
        >
          <span className="material-icons mr-2">refresh</span>
          <span>Generate {recommendations.length > 0 ? "More" : ""} Recommendations</span>
        </button>
      </div>
    </div>
  );
};

export default AIRecommendations;
