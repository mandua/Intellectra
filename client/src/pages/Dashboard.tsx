import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getStudyRecommendations, AIRecommendation, ProductivityData } from "@/lib/ai";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import StudyAnalytics from "@/components/dashboard/StudyAnalytics";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import UpcomingExams from "@/components/dashboard/UpcomingExams";
import FlashcardQuickAccess from "@/components/dashboard/FlashcardQuickAccess";
import { formatDate } from "@/lib/utils";

const Dashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  
  // Demo productivity data
  const productivityData: ProductivityData = {
    timeBlocks: [60, 85, 40, 70, 100, 50],
    subjects: [
      { name: "Mathematics", progress: 85 },
      { name: "Computer Science", progress: 72 },
      { name: "Physics", progress: 65 }
    ]
  };

  // Fetch tasks for today's schedule
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Fetch upcoming exams
  const { data: upcomingExams } = useQuery({
    queryKey: ['/api/exams/upcoming'],
  });

  // Fetch flashcard decks
  const { data: flashcardDecks } = useQuery({
    queryKey: ['/api/flashcard-decks'],
  });

  // Get AI recommendations
  const { mutate: generateRecommendations, isPending: isGeneratingRecommendations } = useMutation({
    mutationFn: async () => {
      const recommendations = await getStudyRecommendations(productivityData);
      return recommendations;
    },
    onSuccess: (recommendations) => {
      setAiRecommendations(recommendations);
    }
  });

  // Load AI recommendations on initial render
  useEffect(() => {
    if (aiRecommendations.length === 0) {
      generateRecommendations();
    }
  }, []);

  // Transform tasks into schedule format
  const scheduleItems = tasks ? tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    time: task.startTime,
    duration: task.duration,
    status: task.completed ? "completed" : task.dueDate < new Date().toISOString() ? "in_progress" : "upcoming"
  })) : [];

  // Weekly progress data 
  const weeklyProgress = {
    weeklyGoals: {
      progress: 65,
      completed: 13,
      total: 20
    },
    tasksCompleted: {
      progress: 42,
      completed: 8,
      total: 19
    },
    quizPerformance: {
      avgScore: 78,
      quizzesTaken: 5
    }
  };

  return (
    <>
      {/* Study Progress Overview */}
      <ProgressOverview 
        weeklyGoals={weeklyProgress.weeklyGoals}
        tasksCompleted={weeklyProgress.tasksCompleted}
        quizPerformance={weeklyProgress.quizPerformance}
      />

      {/* Today's Schedule */}
      <TodaySchedule 
        date={new Date()} 
        scheduleItems={scheduleItems}
        onViewFullSchedule={() => navigate('/planner')}
      />

      {/* Study Analytics and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StudyAnalytics 
          productivityData={productivityData.timeBlocks}
          topSubjects={productivityData.subjects}
        />
        
        <AIRecommendations 
          recommendations={aiRecommendations}
          onGenerateMore={() => generateRecommendations()}
          isLoading={isGeneratingRecommendations}
        />
      </div>

      {/* Upcoming Exams & Flashcard Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UpcomingExams 
          exams={upcomingExams || []}
          onCreateStudyPlan={(examId) => navigate(`/planner?examId=${examId}`)}
        />

        <FlashcardQuickAccess 
          decks={flashcardDecks || []}
          onViewAll={() => navigate('/flashcards')}
          onContinueLearning={(deckId) => navigate(`/flashcards/${deckId}`)}
          onCreateNew={() => navigate('/flashcards/new')}
        />
      </div>
    </>
  );
};

export default Dashboard;
