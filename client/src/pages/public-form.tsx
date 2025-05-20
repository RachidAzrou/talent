import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { insertApplicationSchema } from "@shared/schema";
import { PDFView } from "@/components/pdf/CandidateTemplate";
import { generateCandidateData } from "@/lib/pdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { 
  CheckCircle2, 
  Users, 
  Sprout,
  GraduationCap,
  Briefcase, 
  Binary as BinaryIcon, 
  FileText,
  Heart,
  Award
} from "lucide-react";

export default function PublicForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const { toast } = useToast();
  
  // Form schema - extend the base schema to handle skills as string and add all CV fields
  const formSchema = insertApplicationSchema.extend({
    // Personal information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email address is required"),
    phone: z.string().min(1, "Phone number is required"),
    birthDate: z.string().min(1, "Date of birth is required"),
    
    // Personal profile
    profileSummary: z.string().min(1, "Personal profile is required"),
    
    // Work experience (as string, will be parsed)
    workExperience: z.string().min(1, "Work experience is required"),
    
    // Education (as string, will be parsed)
    education: z.string().min(1, "Education is required"),
    
    // Skills
    skills: z.string()
      .min(1, "Skills are required")
      .transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
    
    languages: z.string().optional(),
    
    // Optional fields
    certificates: z.string().optional(),
    volunteerWork: z.string().optional(),
    hobbies: z.string().optional(),
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      position: "",
      profileSummary: "",
      workExperience: "",
      education: "",
      skills: "",
      languages: "",
      certificates: "",
      volunteerWork: "",
      hobbies: "",
    },
  });

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      // Transform skills from string to array if needed
      const applicationData = {
        ...data,
        skills: Array.isArray(data.skills) ? data.skills : data.skills.split(',').map((s: string) => s.trim())
      };
      
      const res = await apiRequest('POST', '/api/applications/submit', applicationData);
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
    submitMutation.mutate(values);
  }

  // Reset form to submit another application
  const handleReset = () => {
    form.reset();
    setIsSubmitted(false);
    setFormData(null);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#2c3242] to-[#1c212d] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* IT-related Background Elements - similar to login page */}
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
      <div className="w-full max-w-3xl mx-auto relative z-10">
        
        <Card className="w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#2c3242] to-[#3a4357] text-white pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Application Form
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Please fill in all required fields to submit your application.
                </CardDescription>
              </div>
              <div className="bg-[#73b729]/20 p-3 rounded-full">
                <Sprout className="h-8 w-8 text-[#73b729]" />
              </div>
            </div>
          </CardHeader>
          
          {isSubmitted ? (
            <div className="min-h-screen bg-gradient-to-b from-[#2c3242] to-[#1c212d] relative overflow-hidden flex flex-col items-center justify-center p-4">
              {/* Background patterns */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#73b729 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
              </div>
              
              <img src="/assets/Color logo - no background.png" alt="Tecnarit Logo" className="mb-6 relative z-10 h-24" />
              
              <Card className="w-full max-w-md shadow-lg border-0 bg-white/95 backdrop-blur-sm relative z-10">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-[#2c3242]/10 p-3 rounded-full mb-2">
                    <CheckCircle2 className="h-8 w-8 text-[#73b729]" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#73b729]">
                    Thank you for your application!
                  </CardTitle>
                  <CardDescription>
                    Your information has been successfully submitted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    We have received your application and will review it shortly.
                  </p>
                  
                  {formData && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Application Preview</h3>
                      <PDFView
                        data={generateCandidateData(formData)}
                        companyLogo="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSIjM2I4MmY2Ii8+CiAgPHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEFMRU5URk9SR0U8L3RleHQ+Cjwvc3ZnPgo="
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleReset} 
                    className="bg-gradient-to-r from-[#2c3242] to-[#3a4358] hover:from-[#3a4358] hover:to-[#2c3242] text-white font-medium px-6 py-2 h-auto text-sm shadow-md transition-all duration-300 hover:shadow-lg rounded-md"
                  >
                    New Application
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="px-4 py-5 sm:p-6">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-8">
                      <TabsTrigger value="personal" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Personal
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
                    </TabsList>
                    
                    <TabsContent value="personal" className="space-y-6">
                      <div className="border-b border-gray-200 pb-2 mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          <Users className="h-5 w-5 text-[#73b729]" />
                          Personal Information
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Naam */}
                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                autoComplete="given-name"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                autoComplete="family-name"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Geboortedatum */}
                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Contactgegevens */}
                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                autoComplete="tel"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                autoComplete="email"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Current position */}
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position You're Applying For</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Personal profile */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#73b729]" />
                      2. Personal Profile
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="profileSummary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brief Summary About Yourself</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder="Tell us about yourself, your ambitions, and why you're interested in this position..."
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              A short introduction of 50-100 words that describes you as a person and professional.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Education */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-[#73b729]" />
                      3. Education
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education History</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={5}
                                placeholder="For each education: name of degree/diploma, educational institution, location, period (start date - end date), obtained degrees or grades."
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              List your education in reverse chronological order (most recent first).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Work Experience */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <ServerIcon className="h-5 w-5 text-[#73b729]" />
                      4. Work Experience
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="workExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Experience</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={6}
                                placeholder="For each position: job title, company name, location, period (month/year - month/year), main responsibilities and tasks, any notable achievements."
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              List your work experience in reverse chronological order (most recent first).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Skills */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <BinaryIcon className="h-5 w-5 text-[#73b729]" />
                      5. Skills
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technical Skills</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="List technical skills, separated by commas (e.g., Microsoft Office, JavaScript, Adobe Photoshop, etc.)"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              List all relevant technical skills, separated by commas.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language Proficiency</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                placeholder="List languages and proficiency level (e.g., English - native, Spanish - professional, German - basic)"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Certificates (optional) */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#73b729]" />
                      6. Courses / Certificates (optional)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="certificates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certificates and Courses</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="List certificates/courses: course name, institution, year of completion"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: list relevant certificates or courses you have completed.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Volunteer Work (optional) */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <HeartHandshake className="h-5 w-5 text-[#73b729]" />
                      7. Volunteer Work / Side Activities (optional)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="volunteerWork"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volunteer Work and Side Activities</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="List role, organization, period, and contribution/activities"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: list relevant volunteer work or side activities.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section title - Hobbies (optional) */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Puzzle className="h-5 w-5 text-[#73b729]" />
                      8. Hobbies & Interests (optional)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="hobbies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hobbies and Interests</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                placeholder="Describe your hobbies and interests"
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: mention hobbies and interests that may be relevant or that tell something about your personality.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="border-b border-gray-200 pb-2 mb-4 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#73b729]" />
                      9. Cover Letter
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="coverLetter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={5}
                                placeholder="Write your cover letter here..."
                                disabled={submitMutation.isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Explain why you're interested in this position and what makes you unique as a candidate.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="px-4 py-5 sm:px-6 justify-end space-x-3 border-t bg-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={submitMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="btn-gradient" 
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
}
