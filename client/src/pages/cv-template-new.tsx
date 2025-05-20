import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Download,
  FileText,
  Check,
  Upload,
  Image as ImageIcon, 
  Info,
  Palette,
  Settings,
  Sliders,
  User,
  Briefcase,
  GraduationCap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ModernProfessionalTemplate
} from "@/components/templates/TemplateComponents";

// Form schema for CV template settings
const formSchema = z.object({
  templateStyle: z.enum(["modernProfessional"]).default("modernProfessional"),
  companyName: z.string().min(1, "Company name is required"),
  companyLogo: z.string().optional(),
  primaryColor: z.string().default("#73b729"),
  secondaryColor: z.string().default("#2c3242"),
  fontFamily: z.string().default("Inter"),
  contactEmail: z.string().email("Invalid email address").optional(),
  contactPhone: z.string().optional(),
  contactWebsite: z.string().optional(),
  footerText: z.string().optional()
});

// Sample candidate data for preview (matching the public form fields)
const sampleCandidate = {
  firstName: "Sarah",
  lastName: "Vandenberg",
  email: "sarah.vandenberg@example.com",
  phone: "+32 (04) 93 55 22 11",
  birthDate: "15/04/1992",
  currentPosition: "Full Stack Developer",
  summary: "Detail-oriented developer with 5+ years of experience in web application development. Strong proficiency in frontend and backend technologies with a passion for creating intuitive user experiences and maintainable code.",
  skills: ["JavaScript", "React", "Node.js", "TypeScript", "PHP", "Laravel", "SQL", "RESTful APIs", "Git", "Agile/Scrum"],
  experience: [
    {
      title: "Full Stack Developer",
      company: "TechNord Solutions",
      location: "Antwerp",
      startDate: "2021",
      endDate: "Present",
      description: [
        "Developed and maintained multiple client web applications using React and Node.js",
        "Implemented CI/CD pipelines with GitHub Actions to automate testing and deployment",
        "Collaborated with UX/UI designers to create responsive and accessible interfaces"
      ]
    },
    {
      title: "Web Developer",
      company: "Digital Innovations",
      location: "Brussels",
      startDate: "2018",
      endDate: "2021",
      description: [
        "Built and maintained company websites and e-commerce platforms",
        "Developed custom WordPress plugins to extend functionality",
        "Optimized database queries resulting in 40% improved page load time"
      ]
    },
    {
      title: "Junior Developer",
      company: "WebSolutions Agency",
      location: "Ghent",
      startDate: "2016",
      endDate: "2018",
      description: [
        "Assisted in frontend development using HTML, CSS, and JavaScript",
        "Collaborated in team projects using version control (Git)",
        "Participated in daily stand-ups and sprint planning"
      ]
    }
  ],
  education: [
    {
      degree: "Master of Computer Science",
      institution: "University of Antwerp",
      location: "Antwerp",
      graduationDate: "2016"
    },
    {
      degree: "Bachelor of Information Technology",
      institution: "Ghent University College",
      location: "Ghent",
      graduationDate: "2014"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Developer - Associate",
      year: "2022"
    },
    {
      name: "Professional Scrum Master I (PSM I)",
      year: "2020"
    }
  ],
  languages: [
    {
      language: "Dutch",
      proficiency: "Native"
    },
    {
      language: "English",
      proficiency: "Fluent"
    },
    {
      language: "French",
      proficiency: "Intermediate"
    }
  ],
  hobbies: "Photography, hiking, playing piano, and participating in local coding meetups"
};

export default function CVTemplateSelector() {
  const { toast } = useToast();
  // Only using Modern Professional template
  const previewMode = "modernProfessional";
  const [previewLogoUrl, setPreviewLogoUrl] = useState("/attached_assets/logo.png");
  
  // Load saved template settings from localStorage or use defaults
  const getDefaultValues = () => {
    const savedSettings = localStorage.getItem("cvTemplateSettings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
    
    // Default values
    return {
      templateStyle: "modernProfessional",
      companyName: "Tecnarit",
      companyLogo: "/attached_assets/logo.png",
      primaryColor: "#73b729",
      secondaryColor: "#2c3242",
      fontFamily: "Inter",
      contactEmail: "info@tecnarit.com",
      contactPhone: "+32 123 456 789",
      contactWebsite: "www.tecnarit.com",
      footerText: "© Tecnarit. Candidate profile generated by Tecnarit Recruitment System"
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues()
  });
  
  // Update preview when logo changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "companyLogo" && value.companyLogo) {
        setPreviewLogoUrl(value.companyLogo as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Save to localStorage
    localStorage.setItem("cvTemplateSettings", JSON.stringify(values));
    localStorage.setItem("selectedTemplateStyle", values.templateStyle);
    
    // Get template name for display in toast
    const templateName = "Modern Professional";
    
    toast({
      title: "CV Template saved",
      description: `Your template settings have been saved successfully with the ${templateName} template style.`,
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 1MB in size.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const logoUrl = event.target.result as string;
          form.setValue("companyLogo", logoUrl);
          setPreviewLogoUrl(logoUrl);
          
          toast({
            title: "Logo uploaded",
            description: "Your company logo has been uploaded successfully.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-[#73b729] to-green-400 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-gray-800">CV Template</h1>
        </div>
        <p className="text-sm text-gray-500 ml-4">
          Select and customize your preferred CV template for candidate profiles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template Selection - Left Side */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Template Selection Card */}
              <Card className="shadow-md border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#73b729]/10 to-white border-b">
                  <CardTitle className="flex items-center gap-2 text-[#2c3242]">
                    <FileText className="h-5 w-5 text-[#73b729]" />
                    Choose Template Style
                  </CardTitle>
                  <CardDescription>
                    Select your preferred CV template design
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="templateStyle"
                    render={({ field }) => (
                      <FormItem className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                          {/* Modern Professional Option */}
                          <div className="relative rounded-xl ring-2 ring-[#73b729] shadow-lg">
                            <div className="absolute -top-2 -right-2 bg-[#73b729] rounded-full p-1 shadow-md">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-[#2c3242] h-10 w-10 rounded-md flex items-center justify-center">
                                  <Briefcase className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-[#2c3242]">Modern Professional</h3>
                                  <p className="text-xs text-gray-500">Clean, professional design with sidebar</p>
                                </div>
                              </div>
                              
                              <div className="aspect-[4/3] bg-white rounded-md border overflow-hidden relative">
                                <div className="absolute inset-0 p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="w-20 h-5 bg-gray-100 rounded"></div>
                                    <div className="w-8 h-8 rounded bg-[#73b729]"></div>
                                  </div>
                                  
                                  <div className="grid grid-cols-12 gap-2 mt-4 h-[calc(100%-24px)]">
                                    <div className="col-span-4 bg-[#2c3242]/10 rounded-md p-1">
                                      <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                                      <div className="w-full h-1 bg-gray-200 rounded mb-2"></div>
                                      <div className="flex flex-col gap-1 mt-2">
                                        <div className="w-full h-1 bg-gray-200 rounded"></div>
                                        <div className="w-full h-1 bg-gray-200 rounded"></div>
                                        <div className="w-full h-1 bg-gray-200 rounded"></div>
                                      </div>
                                    </div>
                                    
                                    <div className="col-span-8 flex flex-col">
                                      <div className="w-3/4 h-2 bg-gray-200 rounded mb-2"></div>
                                      <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                                      <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                                      <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                                      <div className="w-3/4 h-1 bg-gray-200 rounded mb-1"></div>
                                      
                                      <div className="mt-2">
                                        <div className="w-1/2 h-1.5 bg-[#73b729] rounded mb-1"></div>
                                        <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                                        <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                                        <div className="w-full h-1 bg-gray-200 rounded mb-1"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Branding Settings Card */}
              <Card className="shadow-md border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#73b729]/10 to-white border-b">
                  <CardTitle className="flex items-center gap-2 text-[#2c3242]">
                    <Palette className="h-5 w-5 text-[#73b729]" />
                    Company Branding
                  </CardTitle>
                  <CardDescription>
                    Add your company logo and details
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6 space-y-5">
                  {/* Logo upload section */}
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Company Logo</FormLabel>
                    <div className="flex flex-col md:flex-row gap-5 p-4 bg-gray-50 rounded-lg border">
                      <div className="bg-white rounded-lg border h-32 w-full md:w-1/3 flex items-center justify-center p-4">
                        {form.watch("companyLogo") ? (
                          <img 
                            src={form.watch("companyLogo")} 
                            alt="Company Logo" 
                            className="max-h-24 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center">
                            <ImageIcon className="h-10 w-10 mb-2 text-gray-300" />
                            <span className="text-sm">No logo selected</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full md:w-2/3 flex flex-col justify-between">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Upload Your Logo</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Your logo will appear in the header of all generated CVs. 
                            For best results, use a PNG with transparent background.
                          </p>
                        </div>
                        
                        <div className="flex gap-3">
                          <Input
                            type="file"
                            accept="image/*"
                            id="logo-upload"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="bg-white hover:bg-gray-50 text-[#2c3242] border-[#73b729]/40 hover:border-[#73b729]"
                            onClick={() => document.getElementById("logo-upload")?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2 text-[#73b729]" />
                            Choose Logo
                          </Button>
                          
                          {form.watch("companyLogo") && (
                            <Button
                              type="button"
                              variant="outline"
                              className="bg-white text-red-500 border-red-200 hover:border-red-300 hover:text-red-600"
                              onClick={() => {
                                form.setValue("companyLogo", "");
                                setPreviewLogoUrl("/attached_assets/logo.png");
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <FormDescription>
                      Recommended size: 400×100px, max 1MB
                    </FormDescription>
                  </FormItem>
                  
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your company name" />
                        </FormControl>
                        <FormDescription>
                          This will appear on all generated CVs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Primary Color</FormLabel>
                          <div className="flex gap-3">
                            <div 
                              className="w-10 h-10 rounded-md border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} type="color" className="w-full" />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Main accent color (#73b729 default)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Secondary Color</FormLabel>
                          <div className="flex gap-3">
                            <div 
                              className="w-10 h-10 rounded-md border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} type="color" className="w-full" />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Secondary accent color (#2c3242 default)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#73b729] to-green-500 hover:from-[#68a625] hover:to-green-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Template Settings
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Preview Section - Right Side */}
        <div className="lg:col-span-7">
          <Card className="shadow-md border-0 overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-[#73b729]/10 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-[#2c3242]">
                <FileText className="h-5 w-5 text-[#73b729]" />
                Live Preview
              </CardTitle>
              <CardDescription>
                Preview how your template will look for candidates
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0 flex-grow overflow-hidden">
              <div className="h-full overflow-auto bg-gray-100 p-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-3xl h-full">
                  {/* Template Preview */}
                  <div className="h-full overflow-auto">
                    <ModernProfessionalTemplate 
                      data={sampleCandidate}
                      companyLogo={previewLogoUrl}
                      primaryColor={form.watch("primaryColor")}
                      secondaryColor={form.watch("secondaryColor")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-gray-50 text-[#2c3242] border-[#73b729]/40 hover:border-[#73b729]"
                onClick={() => {
                  toast({
                    title: "Download feature",
                    description: "The Modern Professional template would be used when downloading candidate CVs.",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2 text-[#73b729]" />
                Download Sample
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}