import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-display font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-display font-semibold text-foreground mb-2">
          Page not found
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
