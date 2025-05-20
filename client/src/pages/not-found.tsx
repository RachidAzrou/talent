import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [_, setLocation] = useLocation();

  // Track 404 errors for analytics
  useEffect(() => {
    // Here you could add analytics tracking for 404 errors
    console.log("404 page accessed");
  }, []);

  // Handle "Go Back" action
  const handleGoBack = () => {
    window.history.back();
  };

  // Handle "Go Home" action
  const handleGoHome = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="mb-10">
        <Logo className="h-10" showText useFullLogo />
      </div>
      
      <Card className="w-full max-w-md mx-4 overflow-hidden border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-[#73b729] to-green-400"></div>
        
        <div className="py-8 px-6 bg-[#2c3242] text-white text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm p-5 mb-6 shadow-inner">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <p className="text-2xl font-semibold text-gray-800 mb-3">Pagina niet gevonden</p>
          <div className="w-16 h-1 bg-[#73b729] mx-auto mb-4 rounded-full"></div>
          <p className="text-white/80 max-w-xs mx-auto">
            De pagina die u zoekt bestaat niet of is verplaatst.
          </p>
        </div>
        
        <CardContent className="pt-8 pb-4 text-center">
          <p className="text-gray-600 mb-2">Wat wilt u nu doen?</p>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center p-6 pt-0">
          <Button variant="outline" onClick={handleGoBack} className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 hover:text-[#2c3242]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ga terug
          </Button>
          <Button onClick={handleGoHome} className="w-full sm:w-auto bg-gradient-to-r from-[#73b729] to-green-500 hover:from-[#73b729] hover:to-green-600 border-0 text-white">
            <Home className="mr-2 h-4 w-4" />
            Ga naar Dashboard
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Tecnarit. Alle rechten voorbehouden.</p>
      </div>
    </div>
  );
}
