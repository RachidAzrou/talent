import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertApplicationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import tecnaritLogo from "../assets/tecnarit-logo.png";
import cactusLogo from "../assets/cactus-logo.png";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Users, 
  GraduationCap,
  Briefcase, 
  Binary as BinaryIcon, 
  FileText,
  Heart,
  Award,
  CalendarIcon,
  X,
  Plus
} from "lucide-react";

// Type definitions for structured education items
interface EducationItem {
  id: string;
  yearFrom: string;
  yearTo: string;
  institution: string;
  subject: string;
}

// Type definitions for certifications
interface CertificationItem {
  id: string;
  year: string;
  name: string;
}

// Type definitions for work experience
interface ExperienceItem {
  id: string;
  yearFrom: string;
  yearTo: string;
  jobTitle: string;
  company: string;
  responsibilities: string[];
}

// Type definitions for skills and languages
interface SkillItem {
  id: string;
  name: string;
}

interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
}

export default function PublicForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const { toast } = useToast();
  
  // State for structured form data
  const [educationItems, setEducationItems] = useState<EducationItem[]>([
    { id: crypto.randomUUID(), yearFrom: "", yearTo: "", institution: "", subject: "" }
  ]);
  const [certificationItems, setCertificationItems] = useState<CertificationItem[]>([
    { id: crypto.randomUUID(), year: "", name: "" }
  ]);
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([
    { id: crypto.randomUUID(), yearFrom: "", yearTo: "", jobTitle: "", company: "", responsibilities: [""] }
  ]);
  const [skillItems, setSkillItems] = useState<SkillItem[]>([
    { id: crypto.randomUUID(), name: "" }
  ]);
  const [languageItems, setLanguageItems] = useState<LanguageItem[]>([
    { id: crypto.randomUUID(), language: "", proficiency: "" }
  ]);
  
  // Form schema - extend the base schema to handle skills as string and add all CV fields
  const formSchema = insertApplicationSchema.extend({
    // Personal information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email address is required"),
    phone: z.string().min(1, "Phone number is required"),
    birthDate: z.string()
      .min(1, "Date of birth is required")
      .refine(
        (value) => /^\d{2}\/\d{2}\/\d{4}$/.test(value), 
        { message: "Date must be in DD/MM/YYYY format" }
      ),
    
    // Profile type
    profile: z.string().min(1, "Profile selection is required"),
    
    // Current position
    currentPosition: z.string().min(1, "Current position is required"),
    
    // Personal profile
    profileSummary: z.string().min(1, "Personal profile is required"),
    
    // Availability status
    isAvailable: z.enum(["yes", "no"], {
      required_error: "Please select your availability status",
    }),
    
    // Skills and languages (will be handled separately)
    hobbies: z.string().min(1, "Hobbies and interests are required"),
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profile: "Manual Tester", // Default profile set to Manual Tester
      currentPosition: "",
      profileSummary: "",
      isAvailable: "yes",
      hobbies: "",
    },
  });

  // Helper functions for structured data
  const addEducationItem = () => {
    setEducationItems([
      ...educationItems,
      { id: crypto.randomUUID(), yearFrom: "", yearTo: "", institution: "", subject: "" }
    ]);
  };

  const removeEducationItem = (id: string) => {
    if (educationItems.length > 1) {
      setEducationItems(educationItems.filter(item => item.id !== id));
    }
  };

  const updateEducationItem = (id: string, field: keyof EducationItem, value: string) => {
    setEducationItems(
      educationItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addCertificationItem = () => {
    setCertificationItems([
      ...certificationItems,
      { id: crypto.randomUUID(), year: "", name: "" }
    ]);
  };

  const removeCertificationItem = (id: string) => {
    if (certificationItems.length > 1) {
      setCertificationItems(certificationItems.filter(item => item.id !== id));
    }
  };

  const updateCertificationItem = (id: string, field: keyof CertificationItem, value: string) => {
    setCertificationItems(
      certificationItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addExperienceItem = () => {
    setExperienceItems([
      ...experienceItems,
      { id: crypto.randomUUID(), yearFrom: "", yearTo: "", jobTitle: "", company: "", responsibilities: [""] }
    ]);
  };

  const removeExperienceItem = (id: string) => {
    if (experienceItems.length > 1) {
      setExperienceItems(experienceItems.filter(item => item.id !== id));
    }
  };

  const updateExperienceItem = (id: string, field: keyof Omit<ExperienceItem, "responsibilities">, value: string) => {
    setExperienceItems(
      experienceItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addResponsibility = (experienceId: string) => {
    setExperienceItems(
      experienceItems.map(item => 
        item.id === experienceId 
          ? { ...item, responsibilities: [...item.responsibilities, ""] } 
          : item
      )
    );
  };

  const updateResponsibility = (experienceId: string, index: number, value: string) => {
    setExperienceItems(
      experienceItems.map(item => {
        if (item.id === experienceId) {
          const newResponsibilities = [...item.responsibilities];
          newResponsibilities[index] = value;
          return { ...item, responsibilities: newResponsibilities };
        }
        return item;
      })
    );
  };

  const removeResponsibility = (experienceId: string, index: number) => {
    setExperienceItems(
      experienceItems.map(item => {
        if (item.id === experienceId && item.responsibilities.length > 1) {
          const newResponsibilities = [...item.responsibilities];
          newResponsibilities.splice(index, 1);
          return { ...item, responsibilities: newResponsibilities };
        }
        return item;
      })
    );
  };

  const addSkillItem = () => {
    setSkillItems([
      ...skillItems,
      { id: crypto.randomUUID(), name: "" }
    ]);
  };

  const removeSkillItem = (id: string) => {
    if (skillItems.length > 1) {
      setSkillItems(skillItems.filter(item => item.id !== id));
    }
  };

  const updateSkillItem = (id: string, value: string) => {
    setSkillItems(
      skillItems.map(item => 
        item.id === id ? { ...item, name: value } : item
      )
    );
  };

  const addLanguageItem = () => {
    setLanguageItems([
      ...languageItems,
      { id: crypto.randomUUID(), language: "", proficiency: "" }
    ]);
  };

  const removeLanguageItem = (id: string) => {
    if (languageItems.length > 1) {
      setLanguageItems(languageItems.filter(item => item.id !== id));
    }
  };

  const updateLanguageItem = (id: string, field: keyof LanguageItem, value: string) => {
    setLanguageItems(
      languageItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Sort education items by year (newest first)
  const sortEducationItems = () => {
    setEducationItems(prevItems => {
      const sortedItems = [...prevItems].sort((a, b) => {
        // For empty fields, leave them in current position
        if (!a.yearTo || !b.yearTo) return 0;
        // Sort by yearTo (descending order - newest first)
        return parseInt(b.yearTo) - parseInt(a.yearTo);
      });
      return sortedItems;
    });
  };

  // Sort certification items by year (newest first)
  const sortCertificationItems = () => {
    setCertificationItems(prevItems => {
      const sortedItems = [...prevItems].sort((a, b) => {
        // For empty fields, leave them in current position
        if (!a.year || !b.year) return 0;
        // Sort by year (descending order - newest first)
        return parseInt(b.year) - parseInt(a.year);
      });
      return sortedItems;
    });
  };

  // Sort experience items by year (newest first)
  const sortExperienceItems = () => {
    setExperienceItems(prevItems => {
      const sortedItems = [...prevItems].sort((a, b) => {
        // For empty fields, leave them in current position
        if (!a.yearTo || !b.yearTo) return 0;
        // Sort by yearTo (descending order - newest first)
        return parseInt(b.yearTo) - parseInt(a.yearTo);
      });
      return sortedItems;
    });
  };

  // Validation for structured data
  const validateStructuredData = (): boolean => {
    // Check education items
    const invalidEducation = educationItems.some(
      item => !item.yearFrom || !item.yearTo || !item.institution || !item.subject
    );
    if (invalidEducation) {
      toast({
        title: "Missing education information",
        description: "Please fill in all education fields.",
        variant: "destructive",
      });
      return false;
    }

    // Check certification items
    const invalidCertification = certificationItems.some(
      item => !item.year || !item.name
    );
    if (invalidCertification) {
      toast({
        title: "Missing certification information",
        description: "Please fill in all certification fields.",
        variant: "destructive",
      });
      return false;
    }

    // Check experience items
    const invalidExperience = experienceItems.some(
      item => !item.yearFrom || !item.yearTo || !item.jobTitle || !item.company || 
              item.responsibilities.some(resp => !resp)
    );
    if (invalidExperience) {
      toast({
        title: "Missing work experience information",
        description: "Please fill in all work experience fields and responsibilities.",
        variant: "destructive",
      });
      return false;
    }

    // Check skill items
    const invalidSkills = skillItems.some(item => !item.name);
    if (invalidSkills) {
      toast({
        title: "Missing skills",
        description: "Please fill in all technical skills.",
        variant: "destructive",
      });
      return false;
    }

    // Check language items
    const invalidLanguages = languageItems.some(
      item => !item.language || !item.proficiency
    );
    if (invalidLanguages) {
      toast({
        title: "Missing language information",
        description: "Please fill in all language and proficiency fields.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      // Format structured data to be submitted
      const formattedValues = {
        ...data,
        education: JSON.stringify(educationItems),
        certifications: JSON.stringify(certificationItems),
        workExperience: JSON.stringify(experienceItems),
        skills: skillItems.map(item => item.name),
        languages: JSON.stringify(languageItems),
      };
      
      const res = await apiRequest('POST', '/api/applications/submit', formattedValues);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted",
        description: "Thank you for your application. We will review it shortly.",
        variant: "default",
      });
      setFormData(form.getValues());
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate structured data
    if (!validateStructuredData()) {
      return;
    }
    
    // Sort all structured data chronologically (newest first) before submission
    sortEducationItems();
    sortCertificationItems();
    sortExperienceItems();
    
    // Prepare the application data with all structured fields
    const applicationData = {
      ...values,
      education: educationItems,
      certifications: certificationItems,
      experience: experienceItems,
      skills: skillItems.map(item => item.name).filter(Boolean),
      languages: languageItems
    };
    
    // Short delay to ensure state updates before submission
    setTimeout(() => {
      submitMutation.mutate(applicationData);
    }, 100);
  }

  // Reset form to submit another application
  const handleReset = () => {
    form.reset();
    setIsSubmitted(false);
    
    // Reset structured data
    setEducationItems([{ id: crypto.randomUUID(), yearFrom: "", yearTo: "", institution: "", subject: "" }]);
    setCertificationItems([{ id: crypto.randomUUID(), year: "", name: "" }]);
    setExperienceItems([{ id: crypto.randomUUID(), yearFrom: "", yearTo: "", jobTitle: "", company: "", responsibilities: [""] }]);
    setSkillItems([{ id: crypto.randomUUID(), name: "" }]);
    setLanguageItems([{ id: crypto.randomUUID(), language: "", proficiency: "" }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2c3242] to-[#1c212d] relative overflow-hidden px-4 py-8">
      {/* Background patterns similar to login page */}
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

      <div className="mx-auto max-w-3xl py-4 relative z-10">
        {isSubmitted ? (
          <div>
            <Card className="overflow-hidden">
              <CardHeader className="bg-green-50 border-b">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                  <CardTitle>Application Submitted Successfully!</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-gray-600">
                  Thank you for submitting your application. Our team will review your information and contact you soon.
                </p>
                <div className="flex justify-end">
                  <Button onClick={handleReset}>Submit Another Application</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#2c3242] to-[#3a4357] text-white pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Application Form
                      </CardTitle>
                      <CardDescription className="text-gray-200">
                        Fill in your details to submit your application to Tecnarit.
                      </CardDescription>
                    </div>
                    <div className="bg-[#73b729]/20 p-4 rounded-full">
                      <img src="/Android.png" alt="Tecnarit logo" className="h-8 w-8" />
                    </div>
                  </div>
                </CardHeader>

                <Tabs defaultValue="personal" className="w-full">
                  <div className="px-6 pt-6 border-b overflow-x-auto">
                    <TabsList className="flex justify-start rounded-none border-b px-0 mb-0 w-auto min-w-full md:w-full">
                      <TabsTrigger value="personal" className="rounded-t-md whitespace-nowrap">
                        Personal Info
                      </TabsTrigger>
                      <TabsTrigger value="education" className="rounded-t-md whitespace-nowrap">
                        Education & Certifications
                      </TabsTrigger>
                      <TabsTrigger value="experience" className="rounded-t-md whitespace-nowrap">
                        Work Experience
                      </TabsTrigger>
                      <TabsTrigger value="skills" className="rounded-t-md whitespace-nowrap">
                        Skills & Languages
                      </TabsTrigger>
                      <TabsTrigger value="extra" className="rounded-t-md whitespace-nowrap">
                        Extra Info
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <CardContent className="p-6">
                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-4 mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="profile"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Profile *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your professional profile" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Manual Tester">Manual Tester</SelectItem>
                                  <SelectItem value="Automation Tester">Automation Tester</SelectItem>
                                  <SelectItem value="Performance Tester">Performance Tester</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="+32 (04) 93 40 11 23" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth (DD/MM/YYYY) *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="DD/MM/YYYY" 
                                  value={field.value}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    
                                    // Remove all non-digits
                                    value = value.replace(/[^\d]/g, '');
                                    
                                    // Format as DD/MM/YYYY
                                    if (value.length > 0) {
                                      if (value.length <= 2) {
                                        // Just the day
                                        value = value;
                                      } else if (value.length <= 4) {
                                        // Day and part of month
                                        value = value.slice(0, 2) + '/' + value.slice(2);
                                      } else {
                                        // Day, month and year
                                        value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
                                      }
                                    }
                                    
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Current Position veld is verwijderd */}
                      
                      <FormField
                        control={form.control}
                        name="profileSummary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Summary *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief summary of your professional background, skills, and career objectives..."
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Education & Certifications Tab */}
                    <TabsContent value="education" className="space-y-6 mt-0">
                      {/* Education Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Education
                          </h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addEducationItem}
                            className="text-primary border-primary/20 hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Education
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {educationItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-md relative">
                              {educationItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-red-500"
                                  onClick={() => removeEducationItem(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <FormLabel>From Year *</FormLabel>
                                  <Input
                                    placeholder="2016"
                                    value={item.yearFrom}
                                    onChange={(e) => updateEducationItem(item.id, "yearFrom", e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <FormLabel>To Year *</FormLabel>
                                  <Input
                                    placeholder="2020"
                                    value={item.yearTo}
                                    onChange={(e) => updateEducationItem(item.id, "yearTo", e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <FormLabel>Institution *</FormLabel>
                                  <Input
                                    placeholder="University of Technology"
                                    value={item.institution}
                                    onChange={(e) => updateEducationItem(item.id, "institution", e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <FormLabel>Degree/Subject *</FormLabel>
                                  <Input
                                    placeholder="Bachelor of Computer Science"
                                    value={item.subject}
                                    onChange={(e) => updateEducationItem(item.id, "subject", e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Certifications Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Certifications
                          </h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addCertificationItem}
                            className="text-primary border-primary/20 hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Certification
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {certificationItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-md relative">
                              {certificationItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-red-500"
                                  onClick={() => removeCertificationItem(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <FormLabel>Year *</FormLabel>
                                  <Input
                                    placeholder="2022"
                                    value={item.year}
                                    onChange={(e) => updateCertificationItem(item.id, "year", e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <FormLabel>Certification Name *</FormLabel>
                                  <Input
                                    placeholder="AWS Certified Cloud Practitioner"
                                    value={item.name}
                                    onChange={(e) => updateCertificationItem(item.id, "name", e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Work Experience Tab */}
                    <TabsContent value="experience" className="space-y-6 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          Work Experience
                        </h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addExperienceItem}
                          className="text-primary border-primary/20 hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Experience
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {experienceItems.map((item, index) => (
                          <div key={item.id} className="p-4 border rounded-md relative">
                            {experienceItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-red-500"
                                onClick={() => removeExperienceItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <FormLabel>From Year *</FormLabel>
                                <Input
                                  placeholder="2020"
                                  value={item.yearFrom}
                                  onChange={(e) => updateExperienceItem(item.id, "yearFrom", e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <FormLabel>To Year *</FormLabel>
                                <Input
                                  placeholder="2023 (or 'Present')"
                                  value={item.yearTo}
                                  onChange={(e) => updateExperienceItem(item.id, "yearTo", e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <FormLabel>Job Title *</FormLabel>
                                <Input
                                  placeholder="Senior Software Developer"
                                  value={item.jobTitle}
                                  onChange={(e) => updateExperienceItem(item.id, "jobTitle", e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <FormLabel>Company *</FormLabel>
                                <Input
                                  placeholder="Tech Innovations Inc."
                                  value={item.company}
                                  onChange={(e) => updateExperienceItem(item.id, "company", e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel>Key Responsibilities *</FormLabel>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => addResponsibility(item.id)}
                                  className="text-primary border-primary/20 hover:bg-primary/10"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Responsibility
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {item.responsibilities.map((resp, respIndex) => (
                                  <div key={respIndex} className="flex items-center gap-2">
                                    <Input
                                      placeholder={`Responsibility ${respIndex + 1}`}
                                      value={resp}
                                      onChange={(e) => updateResponsibility(item.id, respIndex, e.target.value)}
                                      className="flex-1"
                                    />
                                    {item.responsibilities.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                        onClick={() => removeResponsibility(item.id, respIndex)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Skills & Languages Tab */}
                    <TabsContent value="skills" className="space-y-6 mt-0">
                      {/* Technical Skills Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <BinaryIcon className="h-5 w-5 text-primary" />
                            Technical Skills
                          </h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addSkillItem}
                            className="text-primary border-primary/20 hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Skill
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {skillItems.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <Input
                                placeholder="e.g., JavaScript, Python, Project Management"
                                value={item.name}
                                onChange={(e) => updateSkillItem(item.id, e.target.value)}
                                className="flex-1"
                              />
                              {skillItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                  onClick={() => removeSkillItem(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Languages Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Languages
                          </h3>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addLanguageItem}
                            className="text-primary border-primary/20 hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Language
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {languageItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Language (e.g., English, Spanish)"
                                  value={item.language}
                                  onChange={(e) => updateLanguageItem(item.id, "language", e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Proficiency (e.g., Native, Fluent, Intermediate)"
                                  value={item.proficiency}
                                  onChange={(e) => updateLanguageItem(item.id, "proficiency", e.target.value)}
                                  className="flex-1"
                                />
                                {languageItems.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                                    onClick={() => removeLanguageItem(item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Extra Information Tab */}
                    <TabsContent value="extra" className="space-y-4 mt-0">
                      <FormField
                        control={form.control}
                        name="hobbies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hobbies & Interests *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your hobbies, interests, or activities outside of work..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Tell us about activities you enjoy in your free time
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isAvailable"
                        render={({ field }) => (
                          <FormItem className="bg-gray-50 p-4 rounded-md border mb-4">
                            <FormLabel className="text-base font-medium mb-2">Are you currently available? *</FormLabel>
                            <div className="flex items-center space-x-4 mt-2">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <FormControl>
                                  <input
                                    type="radio"
                                    value="yes"
                                    checked={field.value === "yes"}
                                    onChange={() => field.onChange("yes")}
                                    className="h-4 w-4 text-primary"
                                  />
                                </FormControl>
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <FormControl>
                                  <input
                                    type="radio"
                                    value="no"
                                    checked={field.value === "no"}
                                    onChange={() => field.onChange("no")}
                                    className="h-4 w-4 text-primary"
                                  />
                                </FormControl>
                                <span>No</span>
                              </label>
                            </div>
                            <FormDescription className="mt-2">
                              Indicate if you are currently available for new job opportunities
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </CardContent>

                  <CardFooter className="bg-gray-50 border-t px-6 py-4 flex justify-center">
                    <Button 
                      type="submit" 
                      className="flex items-center gap-2 px-8 bg-gradient-to-r from-[#73b729] to-[#62a124] hover:from-[#62a124] hover:to-[#558f1e] text-white font-medium h-auto shadow-md transition-all duration-300 hover:shadow-lg rounded-md"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Tabs>
              </Card>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}