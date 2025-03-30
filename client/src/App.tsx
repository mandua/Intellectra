import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layouts/MainLayout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StudyPlanner from "@/pages/StudyPlanner";
import ClassroomCompanion from "@/pages/ClassroomCompanion";
import Flashcards from "@/pages/Flashcards";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/planner" component={StudyPlanner} />
      <Route path="/companion" component={ClassroomCompanion} />
      <Route path="/flashcards" component={Flashcards} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
