import React, { createContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  passwordChangeRequired?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Log passwordChangeRequired status to help with debugging
          console.log("User login status:", data.user.email, "passwordChangeRequired:", data.user.passwordChangeRequired);
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/api/auth/login', { 
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      // Save the token to localStorage
      localStorage.setItem("token", data.token);
      
      // Set the user
      setUser(data.user);
      
      // Redirect to dashboard
      setLocation("/dashboard");
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLocation("/login");
    toast({
      title: "Logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
