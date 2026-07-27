import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Counties from "./pages/Counties";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import DashboardRedirect from "./pages/DashboardRedirect";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";

// Landlord pages
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import AddProperty from "./pages/landlord/AddProperty";
import EditProperty from "./pages/landlord/EditProperty";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";

function Router() {
  return (
    <Switch>
      {/* Public routes with layout */}
      <Route path="/">
        <PublicLayout>
          <Home />
        </PublicLayout>
      </Route>
      <Route path="/properties">
        <PublicLayout>
          <Properties />
        </PublicLayout>
      </Route>
      <Route path="/property/:id">
        <PublicLayout>
          <PropertyDetail />
        </PublicLayout>
      </Route>
      <Route path="/counties">
        <PublicLayout>
          <Counties />
        </PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout>
          <About />
        </PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout>
          <Contact />
        </PublicLayout>
      </Route>
      <Route path="/login">
        <PublicLayout>
          <Login />
        </PublicLayout>
      </Route>
      <Route path="/register">
        <PublicLayout>
          <Register />
        </PublicLayout>
      </Route>
      <Route path="/verify-email">
        <PublicLayout>
          <VerifyEmail />
        </PublicLayout>
      </Route>

      {/* Auth redirect */}
      <Route path="/dashboard">
        <PublicLayout>
          <DashboardRedirect />
        </PublicLayout>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/properties">
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute roles={["admin"]}>
          <AdminSettings />
        </ProtectedRoute>
      </Route>

      {/* Landlord routes */}
      <Route path="/landlord/dashboard">
        <ProtectedRoute roles={["landlord"]}>
          <LandlordDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/landlord/add">
        <ProtectedRoute roles={["landlord"]}>
          <AddProperty />
        </ProtectedRoute>
      </Route>
      <Route path="/landlord/properties">
        <ProtectedRoute roles={["landlord"]}>
          <LandlordDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/landlord/properties/:id/edit">
        <ProtectedRoute roles={["landlord"]}>
          <EditProperty />
        </ProtectedRoute>
      </Route>

      {/* Client routes */}
      <Route path="/client/dashboard">
        <ProtectedRoute roles={["client"]}>
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/client/favorites">
        <ProtectedRoute roles={["client"]}>
          <ClientDashboard />
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route path="/404">
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      </Route>
      <Route>
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
