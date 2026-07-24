import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <AlertCircle className="relative h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-5xl font-extrabold text-foreground mb-2">404</h1>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>
        <Button onClick={() => setLocation("/")} className="gap-2">
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
