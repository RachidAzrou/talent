import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCandidateSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  Plus,
  ArrowLeft
} from "lucide-react";

// Type definitions for structured form items
interface EducationItem {
  id: string;
  yearFrom: string;
  yearTo: string;
  institution: string;
  subject: string;
}

interface CertificationItem {
  id: string;
  year: string;
  name: string;
}

interface ExperienceItem {
  id: string;
  yearFrom: string;
  yearTo: string;
  jobTitle: string;
  company: string;
  responsibilities: string[];
}

interface SkillItem {
  id: string;
  name: string;
}

interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
}

// Extended schema with additional fields
const formSchema = insertCandidateSchema.extend({
  firstname: z.string().min(2, "First name is required"),
  lastname: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  currentPosition: z.string().optional(),
  phone: z.string().optional(),
  motivation: z.string().optional(),
  linkedinUrl: z.string().optional(),
  url: z.string().optional(),
  status: z.string().min(1, "Status is required").default("active"),
});

export default function AddCandidate() {
  const { toast } = useToast();
  
  // State for form success/error
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Form handlers for each item type
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
  
  // Certification handlers
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
  
  // Experience handlers
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
  
  // Skill handlers
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
  
  // Language handlers
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
  
  // Form definition
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      currentPosition: "",
      motivation: "",
      linkedinUrl: "",
      url: "",
      status: "active",
    },
  });
  
  // Handle form submission
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      setIsSubmitting(true);
      
      // Format education items
      const educationArray = educationItems
        .filter(item => item.institution.trim() !== "" && item.subject.trim() !== "")
        .map(item => ({
          period: `${item.yearFrom}-${item.yearTo}`,
          institution: item.institution,
          subject: item.subject,
        }));
      
      // Format certification items
      const certificationArray = certificationItems
        .filter(item => item.name.trim() !== "")
        .map(item => ({
          year: item.year,
          name: item.name
        }));
      
      // Format experience items
      const experienceArray = experienceItems
        .filter(item => item.company.trim() !== "" && item.jobTitle.trim() !== "")
        .map(item => ({
          period: `${item.yearFrom}-${item.yearTo}`,
          company: item.company,
          jobTitle: item.jobTitle,
          responsibilities: item.responsibilities.filter(r => r.trim() !== "")
        }));
      
      // Format skills
      const skillsArray = skillItems
        .map(item => item.name)
        .filter(name => name.trim() !== "");
      
      // Format languages
      const languagesArray = languageItems
        .filter(item => item.language.trim() !== "")
        .map(item => ({
          language: item.language,
          proficiency: item.proficiency
        }));
        
      // Create final structured data for API
      const candidateData = {
        firstName: data.firstname,
        lastName: data.lastname,
        email: data.email,
        phone: data.phone || null,
        currentPosition: data.currentPosition || null,
        linkedinUrl: data.linkedinUrl || null,
        skills: skillsArray,
        // Format structured data to text format for storage
        education: JSON.stringify({
          education: educationArray,
          certifications: certificationArray
        }),
        experience: JSON.stringify({
          jobs: experienceArray,
          languages: languagesArray
        }),
        status: data.status
      };
      
      // Send to API
      const response = await apiRequest({
        url: "/api/candidates",
        method: "POST", 
        data: candidateData
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Candidate Created",
        description: "The candidate has been successfully added to the system."
      });
      // Invalidate candidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      // Navigate back
      window.history.back();
    },
    onError: (error) => {
      console.error("Error creating candidate:", error);
      toast({
        title: "Error",
        description: "There was an error saving the candidate. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });
  
  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate(values);
  }

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
        <Button 
          variant="outline" 
          className="mb-6 bg-white/90 hover:bg-white"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-white border-b relative">
                <div className="absolute right-0 top-0 h-full flex items-center justify-center opacity-20 overflow-hidden">
                  <img 
                    src={cactusLogo} 
                    alt="Tecnarit" 
                    className="h-28 object-contain" 
                    style={{ marginRight: '15px' }} 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-primary" />
                  <CardTitle>Add New Candidate</CardTitle>
                </div>
                <CardDescription>
                  Fill in all required fields to add a new candidate to the system.
                </CardDescription>
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
                      Experience & Languages
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="rounded-t-md whitespace-nowrap">
                      Skills & Interests
                    </TabsTrigger>
                    <TabsTrigger value="status" className="rounded-t-md whitespace-nowrap">
                      Status
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Personal Info Tab */}
                <TabsContent value="personal" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john.doe@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+32 (04) 93 40 11 23" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currentPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivation</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Why are you interested in joining our team?" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                {/* Education & Certifications Tab */}
                <TabsContent value="education" className="p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Education History</h3>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addEducationItem}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    </div>
                    
                    {educationItems.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-md bg-slate-50">
                        <div className="flex justify-between mb-4">
                          <h4 className="font-medium">Education #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeEducationItem(item.id)}
                            disabled={educationItems.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <FormLabel>From Year</FormLabel>
                            <Input 
                              placeholder="2018" 
                              value={item.yearFrom}
                              onChange={(e) => updateEducationItem(item.id, 'yearFrom', e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>To Year</FormLabel>
                            <Input 
                              placeholder="2022" 
                              value={item.yearTo}
                              onChange={(e) => updateEducationItem(item.id, 'yearTo', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <FormLabel>Institution *</FormLabel>
                            <Input 
                              placeholder="University of Brussels" 
                              value={item.institution}
                              onChange={(e) => updateEducationItem(item.id, 'institution', e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>Degree/Subject *</FormLabel>
                            <Input 
                              placeholder="Bachelor of Computer Science" 
                              value={item.subject}
                              onChange={(e) => updateEducationItem(item.id, 'subject', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Certifications</h3>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addCertificationItem}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Certification
                      </Button>
                    </div>
                    
                    {certificationItems.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-md bg-slate-50">
                        <div className="flex justify-between mb-4">
                          <h4 className="font-medium">Certification #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeCertificationItem(item.id)}
                            disabled={certificationItems.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Year</FormLabel>
                            <Input 
                              placeholder="2023" 
                              value={item.year}
                              onChange={(e) => updateCertificationItem(item.id, 'year', e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>Certification Name *</FormLabel>
                            <Input 
                              placeholder="AWS Certified Solutions Architect" 
                              value={item.name}
                              onChange={(e) => updateCertificationItem(item.id, 'name', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Experience & Languages Tab */}
                <TabsContent value="experience" className="p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Work Experience</h3>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addExperienceItem}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Experience
                      </Button>
                    </div>
                    
                    {experienceItems.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-md bg-slate-50">
                        <div className="flex justify-between mb-4">
                          <h4 className="font-medium">Position #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeExperienceItem(item.id)}
                            disabled={experienceItems.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <FormLabel>From Year</FormLabel>
                            <Input 
                              placeholder="2022" 
                              value={item.yearFrom}
                              onChange={(e) => updateExperienceItem(item.id, 'yearFrom', e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>To Year (or "Present")</FormLabel>
                            <Input 
                              placeholder="Present" 
                              value={item.yearTo}
                              onChange={(e) => updateExperienceItem(item.id, 'yearTo', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4 mb-4">
                          <div>
                            <FormLabel>Job Title *</FormLabel>
                            <Input 
                              placeholder="Senior Software Developer" 
                              value={item.jobTitle}
                              onChange={(e) => updateExperienceItem(item.id, 'jobTitle', e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>Company *</FormLabel>
                            <Input 
                              placeholder="Tech Solutions Inc." 
                              value={item.company}
                              onChange={(e) => updateExperienceItem(item.id, 'company', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <FormLabel>Responsibilities</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => addResponsibility(item.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          
                          {item.responsibilities.map((resp, respIndex) => (
                            <div key={respIndex} className="flex items-center gap-2">
                              <Input 
                                placeholder="Led a team of 5 developers for a major project" 
                                value={resp}
                                onChange={(e) => updateResponsibility(item.id, respIndex, e.target.value)}
                                className="flex-1"
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeResponsibility(item.id, respIndex)}
                                disabled={item.responsibilities.length === 1}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Languages</h3>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addLanguageItem}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Language
                      </Button>
                    </div>
                    
                    {languageItems.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-md bg-slate-50">
                        <div className="flex justify-between mb-4">
                          <h4 className="font-medium">Language #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeLanguageItem(item.id)}
                            disabled={languageItems.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Language *</FormLabel>
                            <Input 
                              placeholder="English" 
                              value={item.language}
                              onChange={(e) => updateLanguageItem(item.id, 'language', e.target.value)}
                            />
                          </div>
                          <div>
                            <FormLabel>Proficiency Level</FormLabel>
                            <Input 
                              placeholder="Native / Fluent / Intermediate / Basic" 
                              value={item.proficiency}
                              onChange={(e) => updateLanguageItem(item.id, 'proficiency', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Skills & Interests Tab */}
                <TabsContent value="skills" className="p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BinaryIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Technical Skills</h3>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addSkillItem}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-md border">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {skillItems.map(item => item.name).filter(name => name.trim() !== "").map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-primary/10 hover:bg-primary/20">
                            {skill}
                          </Badge>
                        ))}
                        {skillItems.filter(item => item.name.trim() !== "").length === 0 && (
                          <div className="text-sm text-muted-foreground">No skills added yet</div>
                        )}
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        {skillItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <Input 
                              placeholder="JavaScript, React, Python, etc." 
                              value={item.name}
                              onChange={(e) => updateSkillItem(item.id, e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeSkillItem(item.id)}
                              disabled={skillItems.length === 1}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Status Tab */}
                <TabsContent value="status" className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <div className="relative w-full">
                          <select
                            className={cn(
                              "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <CardFooter className="border-t bg-muted/50 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⠋</span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Candidate
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}