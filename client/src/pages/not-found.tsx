import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Search, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
      <Card className="w-full max-w-md mx-4 glassmorphic-card">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-[var(--color-primary-hover)]" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              404 - Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              We couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white" data-testid="button-w-full">

              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full border-turquoise-200 hover:bg-[var(--color-ocean-50)]" data-testid="button-w-full">

              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button
              onClick={() => setLocation('/events')}
              variant="ghost"
              className="w-full hover:bg-[var(--color-ocean-50)]" data-testid="button-w-full">

              <Search className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact us at{' '}
              <a href="mailto:support@mundotango.life" className="text-[var(--color-primary-hover)] hover:underline" data-testid="a-text-[var(--color-primary-hover)]">
                support@mundotango.life
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);

}