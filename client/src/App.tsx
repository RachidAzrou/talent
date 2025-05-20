import { Route, Switch } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";

// Layouts
import { PublicLayout } from "@/components/PublicLayout";
import { MainLayout } from "@/components/MainLayout";

// Pages
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import PublicForm from "@/pages/public-form-tabbed";
import PublicLeadForm from "@/pages/public-lead-form";

// Preload critical pages for faster navigation
const preloadComponents = () => {
  const componentsToPreload = [
    import("@/pages/dashboard"),
    import("@/pages/clients"),
    import("@/pages/candidates")
  ];
  
  // Preload components in background
  return Promise.all(componentsToPreload);
};

// Lazy-loaded admin pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Admissions = lazy(() => import("@/pages/admissions"));
const Candidates = lazy(() => import("@/pages/candidates"));
const AddCandidate = lazy(() => import("@/pages/add-candidate"));
const Clients = lazy(() => import("@/pages/clients"));
const Notifications = lazy(() => import("@/pages/notifications"));
const CVTemplate = lazy(() => import("@/pages/cv-template-new"));
const Settings = lazy(() => import("@/pages/settings"));


function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        <PublicLayout>
          <Login />
        </PublicLayout>
      </Route>
      <Route path="/apply">
        <PublicLayout>
          <PublicForm />
        </PublicLayout>
      </Route>
      <Route path="/public-lead-form">
        <PublicLayout>
          <PublicLeadForm />
        </PublicLayout>
      </Route>

      {/* Protected routes */}
      <Route path="/">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/dashboard">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/admissions">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Admissions />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/candidates">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Candidates />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/candidates/add">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AddCandidate />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/clients">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Clients />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/notifications">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Notifications />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/cv-template">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CVTemplate />
          </Suspense>
        </MainLayout>
      </Route>
      <Route path="/settings">
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        </MainLayout>
      </Route>


      {/* Fallback route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  // Preload important components after initial render
  useEffect(() => {
    // Small delay to prioritize initial render first
    const timer = setTimeout(() => {
      preloadComponents();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
