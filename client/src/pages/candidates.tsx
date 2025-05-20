import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Candidate } from "@shared/schema";
import { PDFDownloadButton } from "@/components/pdf/CandidateTemplate";
import { generateCandidateData } from "@/lib/pdf";
import { CompanyLogoPlaceholder } from "@/assets/icons";
import tecnaritLogo from "../assets/tecnarit-logo.png";
import cactusLogo from "../assets/cactus-logo.png";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCandidateSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Search, 
  Download,
  Share,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  Briefcase,
  Binary as BinaryIcon,
  FileText,
  X,
  Eye,
  Pencil,
  Plus,
  CheckCircle2,
  Award,
  Heart,
  Globe,
  Filter,
} from "lucide-react";

// Interface for candidate form
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

// Add Candidate Form Component
interface AddCandidateFormProps {
  onSuccess: () => void;
}

function AddCandidateForm({ onSuccess }: AddCandidateFormProps) {
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
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
  const [skillItems, setSkillItems] = useState<SkillItem[]>([
    { id: crypto.randomUUID(), name: "" }
  ]);
  const [languageItems, setLanguageItems] = useState<LanguageItem[]>([
    { id: crypto.randomUUID(), language: "", proficiency: "" }
  ]);
  
  // Form schema
  const formSchema = insertCandidateSchema.extend({
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
    
    // Personal profile
    profileSummary: z.string().min(1, "Personal profile is required"),
    experience: z.string().min(1, "Years of experience is required"),
    
    // Availability status
    isAvailable: z.enum(["yes", "no"], {
      required_error: "Please select availability status",
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
  
  const updateEducationItem = (id: string, field: keyof EducationItem, value: string) => {
    setEducationItems(
      educationItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const removeEducationItem = (id: string) => {
    setEducationItems(educationItems.filter(item => item.id !== id));
  };
  
  const addCertificationItem = () => {
    setCertificationItems([
      ...certificationItems,
      { id: crypto.randomUUID(), year: "", name: "" }
    ]);
  };
  
  const updateCertificationItem = (id: string, field: keyof CertificationItem, value: string) => {
    setCertificationItems(
      certificationItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const removeCertificationItem = (id: string) => {
    setCertificationItems(certificationItems.filter(item => item.id !== id));
  };
  
  const addExperienceItem = () => {
    setExperienceItems([
      ...experienceItems,
      { id: crypto.randomUUID(), yearFrom: "", yearTo: "", jobTitle: "", company: "", responsibilities: [""] }
    ]);
  };
  
  const updateExperienceItem = (id: string, field: keyof Omit<ExperienceItem, "responsibilities">, value: string) => {
    setExperienceItems(
      experienceItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const removeExperienceItem = (id: string) => {
    setExperienceItems(experienceItems.filter(item => item.id !== id));
  };
  
  const addResponsibility = (experienceId: string) => {
    setExperienceItems(
      experienceItems.map(item => {
        if (item.id === experienceId) {
          return {
            ...item,
            responsibilities: [...item.responsibilities, ""]
          };
        }
        return item;
      })
    );
  };
  
  const updateResponsibility = (experienceId: string, index: number, value: string) => {
    setExperienceItems(
      experienceItems.map(item => {
        if (item.id === experienceId) {
          const updatedResponsibilities = [...item.responsibilities];
          updatedResponsibilities[index] = value;
          return {
            ...item,
            responsibilities: updatedResponsibilities
          };
        }
        return item;
      })
    );
  };
  
  const removeResponsibility = (experienceId: string, index: number) => {
    setExperienceItems(
      experienceItems.map(item => {
        if (item.id === experienceId) {
          const updatedResponsibilities = [...item.responsibilities];
          updatedResponsibilities.splice(index, 1);
          return {
            ...item,
            responsibilities: updatedResponsibilities
          };
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
  
  const updateSkillItem = (id: string, value: string) => {
    setSkillItems(
      skillItems.map(item => 
        item.id === id ? { ...item, name: value } : item
      )
    );
  };
  
  const removeSkillItem = (id: string) => {
    setSkillItems(skillItems.filter(item => item.id !== id));
  };
  
  const addLanguageItem = () => {
    setLanguageItems([
      ...languageItems,
      { id: crypto.randomUUID(), language: "", proficiency: "" }
    ]);
  };
  
  const updateLanguageItem = (id: string, field: keyof LanguageItem, value: string) => {
    setLanguageItems(
      languageItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const removeLanguageItem = (id: string) => {
    setLanguageItems(languageItems.filter(item => item.id !== id));
  };

  // Mutation for form submission
  const submitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Extract structured data
      const skillsArray = skillItems.map(item => item.name).filter(name => name.trim() !== "");
      const educationText = educationItems
        .map(item => `${item.yearFrom}-${item.yearTo}: ${item.subject} at ${item.institution}`)
        .join('\n');
      const experienceText = experienceItems
        .map(item => {
          const responsibilities = item.responsibilities
            .filter(resp => resp.trim() !== "")
            .map(resp => `- ${resp}`)
            .join('\n');
          return `${item.yearFrom}-${item.yearTo}: ${item.jobTitle} at ${item.company}\n${responsibilities}`;
        })
        .join('\n\n');
      const languagesText = languageItems
        .map(item => `${item.language} (${item.proficiency})`)
        .join(', ');
      
      // Create candidate data
      const candidateData = {
        ...values,
        skills: skillsArray,
        education: educationText,
        experience: experienceText,
        languages: languagesText,
        isAvailable: values.isAvailable === "yes" ? true : false
      };
      
      return await apiRequest('POST', '/api/candidates', candidateData);
    },
    onSuccess: () => {
      toast({
        title: "Candidate Added",
        description: "The new candidate has been successfully added to the system.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error",
        description: "There was a problem adding the candidate. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Formulier ingediend met waarden:", values);
    // Add the years of experience to the values
    const updatedValues = {
      ...values,
      experience: yearsOfExperience
    };
    console.log("Bijgewerkte waarden voor mutatie:", updatedValues);
    submitMutation.mutate(updatedValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
          e.preventDefault();
          console.log("Form submit event triggered");
          form.handleSubmit(onSubmit)(e);
        }}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <BinaryIcon className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="extra" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Extra Info
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="p-0">
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <SelectValue placeholder="Select a professional profile" />
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
                
                <FormItem className="md:col-span-1">
                  <FormLabel>Years of Experience *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5" 
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
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
                  name="lastName"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="johndoe@example.com" {...field} />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+32 (04) 93 40 11 23" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input placeholder="DD/MM/YYYY" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please enter in DD/MM/YYYY format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="profileSummary"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Professional Summary *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write a brief professional summary or bio..." 
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

              </div>
            </TabsContent>
            
            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6 mt-0">
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <FormLabel>From Year *</FormLabel>
                          <Input
                            placeholder="2018"
                            value={item.yearFrom}
                            onChange={(e) => updateEducationItem(item.id, "yearFrom", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <FormLabel>To Year *</FormLabel>
                          <Input
                            placeholder="2022 (or Present)"
                            value={item.yearTo}
                            onChange={(e) => updateEducationItem(item.id, "yearTo", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="2023 (or Present)"
                          value={item.yearTo}
                          onChange={(e) => updateExperienceItem(item.id, "yearTo", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <FormLabel>Job Title *</FormLabel>
                        <Input
                          placeholder="Senior Software Engineer"
                          value={item.jobTitle}
                          onChange={(e) => updateExperienceItem(item.id, "jobTitle", e.target.value)}
                        />
                      </div>

                      <div>
                        <FormLabel>Company *</FormLabel>
                        <Input
                          placeholder="Tech Solutions Inc."
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
                    <Globe className="h-5 w-5 text-primary" />
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
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Language (e.g., English, French)"
                        value={item.language}
                        onChange={(e) => updateLanguageItem(item.id, "language", e.target.value)}
                        className="flex-1"
                      />
                      <Select 
                        value={item.proficiency}
                        onValueChange={(value) => updateLanguageItem(item.id, "proficiency", value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Native">Native</SelectItem>
                          <SelectItem value="Fluent">Fluent</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Basic">Basic</SelectItem>
                        </SelectContent>
                      </Select>
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
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Extra Information Tab */}
            <TabsContent value="extra" className="space-y-4 mt-0">
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="bg-gray-50 p-4 rounded-md border mb-4">
                    <FormLabel className="text-base font-medium mb-2">Is this candidate available? *</FormLabel>
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
                      Indicate if the candidate is currently available for new opportunities
                    </FormDescription>
                  </FormItem>
                )}
              />
              
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
            </TabsContent>
          </CardContent>

          <DialogFooter className="mt-6">
            <Button 
              type="button"
              onClick={() => {
                console.log("Save button clicked directly");
                const formValues = form.getValues();
                console.log("Form values:", formValues);
                
                // Add the years of experience to the values
                const updatedValues = {
                  ...formValues,
                  experience: yearsOfExperience
                };
                
                // Submit the form data directly
                console.log("Attempting to save candidate with data:", updatedValues);
                submitMutation.mutate(updatedValues);
              }}
              className="flex items-center gap-2 px-8"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Candidate</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </Tabs>
      </form>
    </Form>
  );
}

export default function Candidates() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  // We're using publicFormDialogOpen instead of this state
  // const [addCandidateOpen, setAddCandidateOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [sortField, setSortField] = useState<string>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch all candidates
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['/api/candidates'],
  });

  // Form schema for adding a new candidate
  const formSchema = insertCandidateSchema.extend({
    skills: z.string()
      .transform((val) => val.split(',').map(s => s.trim()).filter(Boolean))
  });

  // Create candidate mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Raw form data received:", data);
      
      // Controleer en transformeer de skills naar array-formaat
      const skills = Array.isArray(data.skills) ? data.skills : 
                     (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
      
      // Maak een nieuw object dat voldoet aan het schema
      const candidateData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        currentPosition: data.currentPosition || "",
        profile: data.profile || "",
        experience: JSON.stringify(data.experience || ""),
        education: JSON.stringify(data.education || ""),
        hobbies: data.hobbies || "",
        skills: skills,
        status: data.status || "active",
        languages: JSON.stringify(data.languages || ""),
        certifications: JSON.stringify(data.certifications || ""),
        linkedinUrl: data.linkedinUrl || "",
        availability: data.isAvailable || "no",
        birthDate: data.birthDate || "",
        summary: data.summary || "",
        notes: data.notes || ""
      };
      
      console.log("Candidate data being sent to API:", candidateData);
      
      // Gebruik een directe fetch call naar onze speciale debug endpoint
      try {
        const response = await fetch('/api/debug/candidates/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(candidateData),
          credentials: 'include'
        });
        
        console.log("Debug endpoint response status:", response.status);
        
        if (!response.ok) {
          // Probeer de foutmelding als tekst te lezen
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Candidate added",
        description: "The candidate has been added successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      setPublicFormDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle deletion of a candidate
  const handleDelete = (id: number) => {
    if (window.confirm("Weet je zeker dat je deze kandidaat wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.")) {
      deleteCandidateMutation.mutate(id);
    }
  };
  
  // Delete candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/candidates/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidate deleted",
        description: "The candidate has been deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete candidate. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update candidate mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/candidates/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidate updated",
        description: "The candidate information has been updated.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      setSelectedCandidate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Dialog state for the candidate application form popup
  const [publicFormDialogOpen, setPublicFormDialogOpen] = useState(false);
  
  // State for structured form data - copied from public-form-tabbed.tsx
  const [educationItems, setEducationItems] = useState<{
    id: string;
    yearFrom: string;
    yearTo: string;
    institution: string;
    subject: string;
  }[]>([
    { id: crypto.randomUUID(), yearFrom: "", yearTo: "", institution: "", subject: "" }
  ]);
  
  const [certificationItems, setCertificationItems] = useState<{
    id: string;
    year: string;
    name: string;
  }[]>([
    { id: crypto.randomUUID(), year: "", name: "" }
  ]);
  
  const [experienceItems, setExperienceItems] = useState<{
    id: string;
    yearFrom: string;
    yearTo: string;
    jobTitle: string;
    company: string;
    responsibilities: string[];
  }[]>([
    { id: crypto.randomUUID(), yearFrom: "", yearTo: "", jobTitle: "", company: "", responsibilities: [""] }
  ]);
  
  const [skillItems, setSkillItems] = useState<{
    id: string;
    name: string;
  }[]>([
    { id: crypto.randomUUID(), name: "" }
  ]);
  
  const [languageItems, setLanguageItems] = useState<{
    id: string;
    language: string;
    proficiency: string;
  }[]>([
    { id: crypto.randomUUID(), language: "", proficiency: "" }
  ]);
  
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

  const updateEducationItem = (id: string, field: string, value: string) => {
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

  const updateCertificationItem = (id: string, field: string, value: string) => {
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

  const updateExperienceItem = (id: string, field: string, value: string) => {
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

  const updateLanguageItem = (id: string, field: string, value: string) => {
    setLanguageItems(
      languageItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  // Function to handle opening the application form dialog
  const openPublicFormDialog = () => {
    // Reset form before opening the dialog
    form.reset();
    
    // Reset all structured data items
    setEducationItems([{ id: crypto.randomUUID(), yearFrom: "", yearTo: "", institution: "", subject: "" }]);
    setCertificationItems([{ id: crypto.randomUUID(), year: "", name: "" }]);
    setExperienceItems([{ id: crypto.randomUUID(), yearFrom: "", yearTo: "", jobTitle: "", company: "", responsibilities: [""] }]);
    setSkillItems([{ id: crypto.randomUUID(), name: "" }]);
    setLanguageItems([{ id: crypto.randomUUID(), language: "", proficiency: "" }]);
    
    setPublicFormDialogOpen(true);
  }

  // Form setup for the candidate form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      currentPosition: "",
      experience: "",
      education: "",
      linkedinUrl: "",
      skills: "",
      status: "active",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate(values);
  }

  // Filter candidates based on status and search query
  const filteredCandidates = React.useMemo(() => {
    let filtered = [...candidates];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((candidate) => candidate.status === statusFilter);
    }
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((candidate) => {
        const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
        const position = (candidate.currentPosition || "").toLowerCase();
        const skillsMatch = Array.isArray(candidate.skills) && 
          candidate.skills.some((skill) => 
            skill.toLowerCase().includes(query)
          );
        
        return fullName.includes(query) || 
               position.includes(query) || 
               skillsMatch;
      });
    }
    
    // Sort the filtered candidates
    return filtered.sort((a, b) => {
      let valueA, valueB;

      // Determine which values to compare based on the sort field
      if (sortField === "profile") {
        valueA = (a.profile || a.currentPosition || "").toLowerCase();
        valueB = (b.profile || b.currentPosition || "").toLowerCase();
      } else if (sortField === "experience") {
        valueA = a.experience ? parseInt(a.experience.replace(/[^\d]/g, '') || "0") : 0;
        valueB = b.experience ? parseInt(b.experience.replace(/[^\d]/g, '') || "0") : 0;
      } else {
        // Default sorting by name
        valueA = (a.firstName + a.lastName).toLowerCase();
        valueB = (b.firstName + b.lastName).toLowerCase();
      }

      // Sort based on the direction
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [candidates, statusFilter, searchQuery, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-[#73b729] to-green-400 rounded-full"></div>
          <p className="text-2xl font-semibold text-gray-800">Candidates</p>
        </div>
        <p className="mt-1 text-sm text-gray-500 pl-4">
          These are your approved candidates. You can view, update, or remove them.
        </p>
      </div>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-primary" />
                  <DialogTitle>Add New Candidate</DialogTitle>
                </div>
                <DialogDescription>
                  Fill in all required fields to add a new candidate to the system.
                </DialogDescription>
              </DialogHeader>
              <AddCandidateForm onSuccess={() => {
                setAddCandidateOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mt-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Search */}
        <div className="sm:col-span-8">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <label htmlFor="search" className="text-sm font-medium text-gray-700">Search Candidates</label>
          </div>
          <div className="mt-1.5 relative rounded-md">
            <Input
              type="text"
              id="search"
              className="w-full"
              placeholder="Name, position, or skills"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="sm:col-span-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Status Filter</label>
          </div>
          <div className="mt-1.5">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Available</SelectItem>
                <SelectItem value="inactive">Not Available</SelectItem>
                <SelectItem value="Manual Tester">Manual Tester</SelectItem>
                <SelectItem value="Automation Tester">Automation Tester</SelectItem>
                <SelectItem value="Performance Tester">Performance Tester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Candidates List */}
      <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Name</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => {
                    if (sortField === "profile") {
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                    } else {
                      setSortField("profile");
                      setSortDirection("asc");
                    }
                  }}>
                    <FileText className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Profile</span>
                    {sortField === "profile" && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => {
                    if (sortField === "experience") {
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                    } else {
                      setSortField("experience");
                      setSortDirection("asc");
                    }
                  }}>
                    <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Experience</span>
                    {sortField === "experience" && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Available</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center justify-end">
                    <Pencil className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-gray-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">No candidates found</p>
                      <p className="text-xs text-gray-400">Adjust your search criteria or add new candidates</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback>{candidate.first_name?.[0] + candidate.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.first_name} {candidate.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-sm text-gray-900">{candidate.profile || candidate.currentPosition}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                      {candidate.experience ? candidate.experience.replace(/[^\d]/g, '') : '0'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      <Badge 
                        variant="outline"
                        className={`
                          ${candidate.status === "active" ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : 
                           "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"}
                          px-2.5 py-0.5 text-xs font-medium
                        `}
                      >
                        {candidate.status === "active" ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedCandidate(candidate)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Bekijken"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDelete(candidate.id)}
                          title="Verwijderen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{filteredCandidates.length}</span> candidate{filteredCandidates.length !== 1 ? 's' : ''} found
            </p>
          </div>

        </div>
      </Card>
      
      {/* Add Candidate Modal */}
      <Dialog open={publicFormDialogOpen} onOpenChange={setPublicFormDialogOpen}>
        <DialogContent className="sm:max-w-3xl p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="overflow-hidden border-0">
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
                    <CardTitle>Add Candidate</CardTitle>
                  </div>
                  <CardDescription>
                    Fill in all required fields to add a new candidate to the system.
                  </CardDescription>
                </CardHeader>

                <Tabs defaultValue="personal" className="w-full">
                  <div className="px-6 pt-6 border-b overflow-x-auto">
                    <TabsList className="flex justify-start rounded-none border-b px-0 mb-0 w-auto min-w-full md:w-full">
                      <TabsTrigger value="personal" className="rounded-t-md whitespace-nowrap flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Personal Info
                      </TabsTrigger>
                      <TabsTrigger value="education" className="rounded-t-md whitespace-nowrap flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Education & Certifications
                      </TabsTrigger>
                      <TabsTrigger value="experience" className="rounded-t-md whitespace-nowrap flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Work Experience
                      </TabsTrigger>
                      <TabsTrigger value="skills" className="rounded-t-md whitespace-nowrap flex items-center gap-2">
                        <BinaryIcon className="h-4 w-4" />
                        Skills & Languages
                      </TabsTrigger>
                      <TabsTrigger value="extra" className="rounded-t-md whitespace-nowrap flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Extra Info
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <CardContent className="p-0">
                    <TabsContent value="personal" className="p-6 mt-0 border-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="profile"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Profile <span className="text-red-500">*</span></FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a professional profile" />
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
                            name="experience"
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>Years of Experience <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="5" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
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
                                <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
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
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="City, Country" {...field} />
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
                                <FormLabel>Current Position <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Senior Developer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Profile is already defined above */}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://linkedin.com/in/..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="interviewing">Interviewing</SelectItem>
                                    <SelectItem value="placed">Placed</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="p-6 mt-0 border-0">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Education</h3>
                          <p className="text-sm text-gray-500 mb-4">Add your educational background, with most recent first.</p>
                          
                          {educationItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-md mb-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Education #{index + 1}</h4>
                                {educationItems.length > 1 && (
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeEducationItem(item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Year From <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. 2015" 
                                    value={item.yearFrom}
                                    onChange={(e) => updateEducationItem(item.id, 'yearFrom', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Year To <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. 2019 or Present" 
                                    value={item.yearTo}
                                    onChange={(e) => updateEducationItem(item.id, 'yearTo', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-medium">Degree/Subject <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. Bachelor of Computer Science" 
                                    value={item.subject}
                                    onChange={(e) => updateEducationItem(item.id, 'subject', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-medium">Institution <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. University of Technology" 
                                    value={item.institution}
                                    onChange={(e) => updateEducationItem(item.id, 'institution', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={addEducationItem}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Certifications</h3>
                          <p className="text-sm text-gray-500 mb-4">Add any professional certifications you have obtained.</p>
                          
                          {certificationItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-md mb-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Certification #{index + 1}</h4>
                                {certificationItems.length > 1 && (
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeCertificationItem(item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Year <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. 2020" 
                                    value={item.year}
                                    onChange={(e) => updateCertificationItem(item.id, 'year', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-medium">Certification Name <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. AWS Certified Solutions Architect" 
                                    value={item.name}
                                    onChange={(e) => updateCertificationItem(item.id, 'name', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={addCertificationItem}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="p-6 mt-0 border-0">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Work Experience</h3>
                          <p className="text-sm text-gray-500 mb-4">Add your work history, starting with the most recent position.</p>
                          
                          {experienceItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-md mb-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Position #{index + 1}</h4>
                                {experienceItems.length > 1 && (
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeExperienceItem(item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Year From <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. 2018" 
                                    value={item.yearFrom}
                                    onChange={(e) => updateExperienceItem(item.id, 'yearFrom', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Year To <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. 2022 or Present" 
                                    value={item.yearTo}
                                    onChange={(e) => updateExperienceItem(item.id, 'yearTo', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Job Title <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. Senior Developer" 
                                    value={item.jobTitle}
                                    onChange={(e) => updateExperienceItem(item.id, 'jobTitle', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Company <span className="text-red-500">*</span></label>
                                  <Input 
                                    placeholder="e.g. Tech Solutions Inc." 
                                    value={item.company}
                                    onChange={(e) => updateExperienceItem(item.id, 'company', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2 mb-2">
                                <label className="text-sm font-medium">Responsibilities <span className="text-red-500">*</span></label>
                                {item.responsibilities.map((resp, respIndex) => (
                                  <div key={respIndex} className="flex gap-2 items-start">
                                    <Input
                                      placeholder="Describe your responsibility"
                                      value={resp}
                                      onChange={(e) => updateResponsibility(item.id, respIndex, e.target.value)}
                                      className="flex-1"
                                    />
                                    {item.responsibilities.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeResponsibility(item.id, respIndex)}
                                        className="px-2"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addResponsibility(item.id)}
                                  className="mt-1"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Responsibility
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={addExperienceItem}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Work Experience
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="p-6 mt-0 border-0">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Technical Skills</h3>
                          <p className="text-sm text-gray-500 mb-4">List your technical skills and technologies you are proficient with.</p>
                          
                          <div className="space-y-3 mb-4">
                            {skillItems.map((item, index) => (
                              <div key={item.id} className="flex gap-2 items-center">
                                <Input
                                  placeholder="e.g. JavaScript"
                                  value={item.name}
                                  onChange={(e) => updateSkillItem(item.id, e.target.value)}
                                  className="flex-1"
                                />
                                {skillItems.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSkillItem(item.id)}
                                    className="px-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={addSkillItem}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Skill
                          </Button>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Languages</h3>
                          <p className="text-sm text-gray-500 mb-4">List languages you speak and your proficiency level.</p>
                          
                          <div className="space-y-3 mb-4">
                            {languageItems.map((item, index) => (
                              <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex gap-2 items-center">
                                  <Input
                                    placeholder="e.g. English"
                                    value={item.language}
                                    onChange={(e) => updateLanguageItem(item.id, 'language', e.target.value)}
                                    className="flex-1"
                                  />
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Select
                                    value={item.proficiency}
                                    onValueChange={(value) => updateLanguageItem(item.id, 'proficiency', value)}
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Proficiency level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Native">Native</SelectItem>
                                      <SelectItem value="Fluent">Fluent</SelectItem>
                                      <SelectItem value="Advanced">Advanced</SelectItem>
                                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                                      <SelectItem value="Basic">Basic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  {languageItems.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLanguageItem(item.id)}
                                      className="px-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={addLanguageItem}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Language
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="extra" className="p-6 mt-0 border-0">
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={8}
                                  placeholder="Add any additional information that might be relevant for this candidate"
                                  className="resize-none"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between p-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPublicFormDialogOpen(false)}
                      disabled={createMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                          Adding...
                        </>
                      ) : "Add Candidate"}
                    </Button>
                  </CardFooter>
                </Tabs>
              </Card>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Candidate Modal */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="max-w-4xl">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>Candidate Details</DialogTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="md:w-1/3 mb-6 md:mb-0">
                  {/* Candidate Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <AvatarFallback className="text-lg">
                          {selectedCandidate.firstName[0] + selectedCandidate.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {selectedCandidate.firstName} {selectedCandidate.lastName}
                        </h4>
                        <p className="text-gray-600">{selectedCandidate.currentPosition}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-sm text-gray-700">{selectedCandidate.email}</span>
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="text-sm text-gray-700">{selectedCandidate.phone}</span>
                        </div>
                      )}
                      {selectedCandidate.location && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{selectedCandidate.location}</span>
                        </div>
                      )}
                      {selectedCandidate.linkedinUrl && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.5 8.5a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2a.5.5 0 01.5.5z" />
                            <path fillRule="evenodd" d="M6 15a2 2 0 100-4 2 2 0 000 4zm0 1a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2zm2.5 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-1 5.5a.5.5 0 01.5-.5h1v-2a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v2h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1v2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2h-1a.5.5 0 01-.5-.5v-1z" clipRule="evenodd" />
                          </svg>
                          <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Candidate Status */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                    <div className="mb-4">
                      <Badge variant={
                        selectedCandidate.status === "active" ? "success" :
                        selectedCandidate.status === "interviewing" ? "warning" :
                        selectedCandidate.status === "placed" ? "default" :
                        "outline"
                      }>
                        {selectedCandidate.status === "active" ? "Active" :
                         selectedCandidate.status === "interviewing" ? "Interviewing" :
                         selectedCandidate.status === "placed" ? "Placed" :
                         "Inactive"}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Added on {format(new Date(selectedCandidate.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {/* PDF Export */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Resume</h4>
                    <div className="border border-gray-300 rounded-md bg-white p-2 mb-3 h-48 flex items-center justify-center">
                      {/* PDF Preview Placeholder */}
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          {selectedCandidate.firstName} {selectedCandidate.lastName} - Resume.pdf
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <PDFDownloadButton 
                        data={generateCandidateData(selectedCandidate)}
                        companyLogo="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSIjM2I4MmY2Ii8+CiAgPHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEFMRU5URk9SR0U8L3RleHQ+Cjwvc3ZnPgo="
                        fileName={`${selectedCandidate.firstName.toLowerCase()}_${selectedCandidate.lastName.toLowerCase()}_resume.pdf`}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition flex items-center justify-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </PDFDownloadButton>
                      <Button variant="primary" className="flex-1">
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  {/* Candidate Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="profile" className="flex-grow">Profile</TabsTrigger>
                      <TabsTrigger value="experience" className="flex-grow">Experience</TabsTrigger>
                      <TabsTrigger value="skills" className="flex-grow">Skills</TabsTrigger>
                      <TabsTrigger value="notes" className="flex-grow">Notes</TabsTrigger>
                    </TabsList>
                    
                    {/* Profile Tab */}
                    <TabsContent value="profile" className="pt-4">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                              <p className="text-gray-900">{selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                              <p className="text-gray-900">{selectedCandidate.email}</p>
                            </div>
                            {selectedCandidate.phone && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <p className="text-gray-900">{selectedCandidate.phone}</p>
                              </div>
                            )}
                            {selectedCandidate.location && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <p className="text-gray-900">{selectedCandidate.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedCandidate.notes && (
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Summary</h4>
                            <p className="text-gray-700 whitespace-pre-line">
                              {selectedCandidate.notes}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-3">Professional Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCandidate.currentPosition && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                                <p className="text-gray-900">{selectedCandidate.currentPosition}</p>
                              </div>
                            )}
                            {selectedCandidate.experience && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                <p className="text-gray-900">{selectedCandidate.experience}</p>
                              </div>
                            )}
                            {selectedCandidate.education && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                                <p className="text-gray-900">{selectedCandidate.education}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Experience Tab */}
                    <TabsContent value="experience" className="pt-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Work Experience</h4>
                      <div className="whitespace-pre-line text-gray-700">
                        {selectedCandidate.experience || "No detailed experience information available."}
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mt-6 mb-3">Education</h4>
                      <div className="whitespace-pre-line text-gray-700">
                        {selectedCandidate.education || "No detailed education information available."}
                      </div>
                    </TabsContent>
                    
                    {/* Skills Tab */}
                    <TabsContent value="skills" className="pt-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selectedCandidate.skills) && selectedCandidate.skills.map((skill, idx) => (
                            <Badge key={idx} className="px-3 py-1 bg-gray-100 text-gray-800">
                              {skill}
                            </Badge>
                          ))}
                          {(!Array.isArray(selectedCandidate.skills) || selectedCandidate.skills.length === 0) && (
                            <p className="text-gray-500">No skills listed</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Notes Tab */}
                    <TabsContent value="notes" className="pt-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Notes</h4>
                        <Button size="sm" variant="outline">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Add Note
                        </Button>
                      </div>
                      
                      {selectedCandidate.notes ? (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="whitespace-pre-line text-gray-700">{selectedCandidate.notes}</p>
                          <div className="mt-3 text-sm text-gray-500">
                            Added on {format(new Date(selectedCandidate.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No notes have been added for this candidate.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                  Close
                </Button>
                <Button variant="default">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Candidate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
