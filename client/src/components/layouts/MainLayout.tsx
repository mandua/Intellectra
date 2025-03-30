import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isMobile = useMobile();
  const [location] = useLocation();

  // Setup theme based on user preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    {
      href: "/",
      title: "Dashboard",
      icon: <span className="material-icons">dashboard</span>,
    },
    {
      href: "/planner",
      title: "Study Planner",
      icon: <span className="material-icons">event_note</span>,
    },
    {
      href: "/companion",
      title: "Classroom Companion",
      icon: <span className="material-icons">note_alt</span>,
    },
    {
      href: "/flashcards",
      title: "Flashcards & Quizzes",
      icon: <span className="material-icons">style</span>,
    },
  ];

  const footerItems = [
    {
      href: "/settings",
      title: "Settings",
      icon: <span className="material-icons">settings</span>,
    },
  ];

  // Get page title based on current route
  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location === "/planner") return "Study Planner";
    if (location === "/companion") return "Classroom Companion";
    if (location === "/flashcards") return "Flashcards & Quizzes";
    return "StudyAI";
  };

  return (
    <div className="font-sans bg-[#f5f7fa] dark:bg-[#121212] text-[#212121] dark:text-[#e0e0e0] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-DEFAULT dark:bg-primary-dark text-white shadow-md z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                id="sidebar-toggle" 
                className="mr-2 md:hidden" 
                aria-label="Toggle navigation"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="material-icons">menu</span>
              </button>
              <div className="flex items-center">
                <span className="material-icons text-2xl mr-2">school</span>
                <h1 className="text-xl font-medium">StudyAI</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                id="theme-toggle" 
                className="p-2 rounded-full hover:bg-primary-light dark:hover:bg-primary-light/20 transition-colors" 
                aria-label="Toggle theme"
                onClick={toggleTheme}
              >
                <span className="material-icons dark:hidden">dark_mode</span>
                <span className="material-icons hidden dark:inline">light_mode</span>
              </button>
              <div className="relative ml-4">
                <button className="flex items-center focus:outline-none" aria-label="User menu">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                    JS
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <Sidebar
          open={!isMobile || sidebarOpen}
          onOpenChange={setSidebarOpen}
          userInfo={{ name: "John Smith" }}
          navItems={navItems}
          footerItems={footerItems}
        />

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          <div className="container mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-medium mb-2">{getPageTitle()}</h2>
              <p className="text-text-light-secondary dark:text-text-dark-secondary">
                Welcome back, John! Here's your learning progress.
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-700 z-10">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = item.href === location || 
                               (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <a 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    "flex flex-col items-center py-2 px-4",
                    isActive 
                      ? "text-primary-DEFAULT dark:text-primary-light" 
                      : "text-text-light-secondary dark:text-text-dark-secondary"
                  )}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.title.split(' ')[0]}</span>
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default MainLayout;
