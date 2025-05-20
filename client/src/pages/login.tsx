import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { Logo } from "@/components/Logo";
import { Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// UI components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  // Check if user needs to change password
  useEffect(() => {
    if (user?.passwordChangeRequired) {
      setShowPasswordChangeDialog(true);
    }
  }, [user]);

  // Password change schema
  const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], 
  });

  // Form validation schema
  const formSchema = loginSchema;
  type FormData = z.infer<typeof formSchema>;

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate the form
      const validatedData = passwordChangeSchema.parse(passwordChangeForm);
      
      // Check if passwords match
      if (validatedData.newPassword !== validatedData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
      
      // Make API call to change password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: validatedData.currentPassword,
          newPassword: validatedData.newPassword,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setShowPasswordChangeDialog(false);
        // Redirect to dashboard
        setLocation("/dashboard");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid form data",
        variant: "destructive",
      });
    }
  };
  
  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled in the AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2c3242] to-[#1c212d] px-4 relative overflow-hidden">
      {/* IT-related Background Elements */}
      <div className="absolute inset-0 opacity-20">
        {/* Code patterns - dots grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#73b729 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
        
        {/* IT-related SVG elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Circuit board patterns */}
          <svg className="absolute top-20 left-20 w-80 h-80 text-[#73b729]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,10 L90,10 L90,90 L10,90 Z" stroke="currentColor" strokeWidth="2" />
            <circle cx="10" cy="10" r="3" fill="currentColor" />
            <circle cx="90" cy="10" r="3" fill="currentColor" />
            <circle cx="10" cy="90" r="3" fill="currentColor" />
            <circle cx="90" cy="90" r="3" fill="currentColor" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
            <line x1="10" y1="50" x2="45" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="55" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="10" x2="50" y2="45" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="55" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
          </svg>
          
          {/* Server-like icon */}
          <svg className="absolute bottom-20 right-20 w-60 h-60 text-[#73b729]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="60" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
            <rect x="20" y="40" width="60" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
            <rect x="20" y="60" width="60" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
            <circle cx="30" cy="27.5" r="3" fill="currentColor" />
            <circle cx="30" cy="47.5" r="3" fill="currentColor" />
            <circle cx="30" cy="67.5" r="3" fill="currentColor" />
          </svg>
          
          {/* Code brackets */}
          <svg className="absolute top-40 right-40 w-64 h-64 text-[#73b729]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,20 L10,50 L30,80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M70,20 L90,50 L70,80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          
          {/* Binary code in background */}
          <div className="absolute bottom-10 left-10 text-lg text-[#73b729] font-mono font-bold">
            10110101 01001010<br />
            01010101 10101010<br />
            11001010 01010101<br />
          </div>
        </div>
      </div>
      
      {/* Logo top placement */}
      <div className="absolute top-10 left-0 right-0 flex justify-center">
        <img src="/assets/Color logo - no background.png" alt="Tecnarit Logo" className="h-32 w-auto" />
      </div>
      
      {/* Main card with branding colors */}
      <Card className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden border border-[#73b729]/10 z-10 mt-10">
        {/* Green accent bar at top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#73b729] to-[#8dd03e]"></div>
        
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-3xl font-bold text-[#2c3242] flex items-center justify-center gap-2">
            <Users className="h-7 w-7 text-[#73b729]" />
            TECNARIT HR
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2c3242] font-medium">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        {...field} 
                        type="email"
                        disabled={isLoading}
                        className="border-[#2c3242]/20 focus-visible:ring-[#73b729] focus-visible:border-[#73b729]" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-[#2c3242] font-medium">Password</FormLabel>
                      <a href="#" className="text-sm text-[#73b729] hover:text-[#8dd03e] font-medium">
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                        className="border-[#2c3242]/20 focus-visible:ring-[#73b729] focus-visible:border-[#73b729]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="remember" className="text-[#73b729] border-[#2c3242]/30 data-[state=checked]:bg-[#73b729] data-[state=checked]:border-[#73b729]" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none text-[#2c3242]/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-2 font-medium bg-[#73b729] hover:bg-[#8dd03e] text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChangeDialog} onOpenChange={setShowPasswordChangeDialog}>
        <DialogContent className="sm:max-w-md border border-[#73b729]/20 shadow-lg">
          {/* Green accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#73b729] to-[#8dd03e]"></div>
          
          <DialogHeader className="pt-6">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#2c3242]">
              <AlertTriangle className="h-6 w-6 text-[#73b729]" />
              <span>Password Change Required</span>
            </DialogTitle>
            <DialogDescription className="text-[#2c3242]/70">
              Your account requires a password change. Please set a new secure password to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert className="mb-5 border-[#73b729]/20 bg-[#73b729]/5">
              <AlertTriangle className="h-4 w-4 text-[#73b729]" />
              <AlertTitle className="font-semibold text-[#2c3242]">Security Reminder</AlertTitle>
              <AlertDescription className="text-[#2c3242]/80">
                This is a requirement set by your administrator. Choose a strong, unique password.
              </AlertDescription>
            </Alert>
            
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="grid w-full items-center gap-3">
                <label htmlFor="currentPassword" className="text-sm font-medium text-[#2c3242]">
                  Current Password
                </label>
                <Input 
                  type="password" 
                  id="currentPassword"
                  placeholder="Enter your current password" 
                  value={passwordChangeForm.currentPassword}
                  onChange={(e) => setPasswordChangeForm({
                    ...passwordChangeForm,
                    currentPassword: e.target.value
                  })}
                  className="border-[#2c3242]/20 focus-visible:ring-[#73b729] focus-visible:border-[#73b729]"
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-3">
                <label htmlFor="newPassword" className="text-sm font-medium text-[#2c3242]">
                  New Password
                </label>
                <Input 
                  type="password" 
                  id="newPassword"
                  placeholder="At least 8 characters" 
                  value={passwordChangeForm.newPassword}
                  onChange={(e) => setPasswordChangeForm({
                    ...passwordChangeForm,
                    newPassword: e.target.value
                  })}
                  className="border-[#2c3242]/20 focus-visible:ring-[#73b729] focus-visible:border-[#73b729]"
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-3">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-[#2c3242]">
                  Confirm New Password
                </label>
                <Input 
                  type="password" 
                  id="confirmPassword"
                  placeholder="Confirm your new password" 
                  value={passwordChangeForm.confirmPassword}
                  onChange={(e) => setPasswordChangeForm({
                    ...passwordChangeForm,
                    confirmPassword: e.target.value
                  })}
                  className="border-[#2c3242]/20 focus-visible:ring-[#73b729] focus-visible:border-[#73b729]"
                  required
                />
              </div>
              
              <DialogFooter className="sm:justify-end pt-2">
                <Button 
                  type="submit" 
                  className="mt-4 font-medium bg-[#73b729] hover:bg-[#8dd03e] text-white border-none"
                >
                  Change Password
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
