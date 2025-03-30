import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StudyPlanner from "@/pages/StudyPlanner";
import Classroom from "@/pages/Classroom";
import Flashcards from "@/pages/Flashcards";
import LearningPath from "@/pages/LearningPath";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/study-planner" component={StudyPlanner} />
      <Route path="/classroom" component={Classroom} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/learning-path" component={LearningPath} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  const [location] = useLocation();
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <div className="flex flex-col md:flex-row min-h-screen">
            {/* Fixed theme toggle */}
            <ThemeToggle />
            
            {/* Sidebar - visible on md+ screens */}
            <Sidebar />
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-800 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
                  <span className="material-icons text-xl">school</span>
                </div>
                <h1 className="text-lg font-bold text-primary dark:text-primary-light">StudyAI</h1>
              </div>
              <button 
                className="p-1 rounded-md text-neutral-700 dark:text-neutral-300"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span className="material-icons">menu</span>
              </button>
            </div>
            
            {/* Mobile Menu (Hidden by default) */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 bg-neutral-900/50 md:hidden">
                <div className="w-64 h-full bg-white dark:bg-neutral-800 shadow-lg animate-fadeIn">
                  <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
                        <span className="material-icons text-xl">school</span>
                      </div>
                      <h1 className="text-lg font-bold text-primary dark:text-primary-light">StudyAI</h1>
                    </div>
                    <button 
                      className="p-1 rounded-md text-neutral-700 dark:text-neutral-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                  <MobileNav onClose={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
              <Router />
            </main>
            
            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 shadow-lg border-t border-neutral-200 dark:border-neutral-700 flex justify-around">
              <a href="/" className={`p-3 flex flex-col items-center ${location === '/' ? 'text-primary dark:text-primary-light' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <span className="material-icons text-xl">dashboard</span>
                <span className="text-xs mt-1">Dashboard</span>
              </a>
              <a href="/study-planner" className={`p-3 flex flex-col items-center ${location === '/study-planner' ? 'text-primary dark:text-primary-light' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <span className="material-icons text-xl">event_note</span>
                <span className="text-xs mt-1">Planner</span>
              </a>
              <a href="/flashcards" className={`p-3 flex flex-col items-center ${location === '/flashcards' ? 'text-primary dark:text-primary-light' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <span className="material-icons text-xl">style</span>
                <span className="text-xs mt-1">Flashcards</span>
              </a>
              <a href="/classroom" className={`p-3 flex flex-col items-center ${location === '/classroom' ? 'text-primary dark:text-primary-light' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <span className="material-icons text-xl">school</span>
                <span className="text-xs mt-1">Classroom</span>
              </a>
              <a href="/learning-path" className={`p-3 flex flex-col items-center ${location === '/learning-path' ? 'text-primary dark:text-primary-light' : 'text-neutral-500 dark:text-neutral-400'}`}>
                <span className="material-icons text-xl">route</span>
                <span className="text-xs mt-1">Learn</span>
              </a>
            </nav>
          </div>
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
