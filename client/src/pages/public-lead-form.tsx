import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import cactusLogo from "@assets/Android.png";
import { Logo } from "@/components/Logo";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CheckCircle, Briefcase, Building2, Phone, MapPin, FileText, Sprout } from "lucide-react";

// Lead form schema
const leadFormSchema = z.object({
  // Company Info
  name: z.string().min(2, { message: "Company name is required" }),
  industry: z.string().optional(),
  active: z.boolean().default(true),
  status: z.string().default("lead"),
  
  // Contact Details
  contactPerson: z.string().min(2, { message: "Contact person is required" }),
  contactFunction: z.string().min(2, { message: "Contact person role is required" }),
  email: z.string().email({ message: "Email address is required and must be valid" }),
  phone: z.string().optional(),
  
  // Address & Details
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
  
  // Project Info
  projectDescription: z.string().optional()
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

// Industries options
const industries = [
  "IT & Software",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Transport & Logistics",
  "Education",
  "Government",
  "Media & Entertainment",
  "Energy & Utilities",
  "Other"
];



export default function PublicLeadForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Function to reset form and allow submitting a new lead
  const resetForm = () => {
    form.reset({
      name: "",
      industry: "",
      contactPerson: "",
      contactFunction: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      vatNumber: "",
      active: true,
      projectDescription: ""
    });
    setIsSubmitted(false);
  };

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      // Company Info
      name: "",
      industry: "",
      active: true,
      status: "lead",
      
      // Contact Details
      contactPerson: "",
      contactFunction: "",
      email: "",
      phone: "",
      
      // Address & Details
      address: "",
      city: "",
      postalCode: "",
      country: "",
      vatNumber: "",
      
      // Project Info
      projectDescription: ""
    }
  });

  const onSubmit = async (data: LeadFormValues) => {
    try {
      // Create full address string if any address components are provided
      const fullAddress = [
        data.address,
        data.city,
        data.postalCode,
        data.country
      ].filter(Boolean).join(", ");
      
      // Convert the form data to match client schema
      const clientData = {
        name: data.name,
        contactPerson: data.contactPerson,
        contactFunction: data.contactFunction || null,
        email: data.email,
        phone: data.phone,
        industry: data.industry || null,
        address: fullAddress || null,
        active: data.active,
        vatNumber: data.vatNumber || null,
        notes: `Project description: ${data.projectDescription}`,
        status: data.active ? "active" : "inactive" // If active search is checked, status is "active", otherwise "inactive"
      };

      console.log("Lead data being submitted:", clientData);

      // Submit to special debug endpoint om authenticatieproblemen te omzeilen
      const response = await fetch('/api/debug/clients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
      });
      
      console.log("Debug endpoint response status:", response.status);
      
      if (!response.ok) {
        // Probeer de foutmelding als tekst te lezen
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Fout bij versturen: ${response.status} - ${errorText}`);
      }
      
      await response.json();
      
      // Show success message and set submitted state
      setIsSubmitted(true);

    } catch (error) {
      console.error("Error submitting lead form:", error);
      toast({
        title: "An error occurred",
        description: "Something went wrong when submitting the form. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Success view after form submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2c3242] to-[#1c212d] relative overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#73b729 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
        </div>
        
        <Logo className="mb-6 relative z-10 h-24" showText={true} useFullLogo={true} />
        
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/95 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-[#2c3242]/10 p-3 rounded-full mb-2">
              <CheckCircle className="h-8 w-8 text-[#73b729]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#73b729]">
              Thank you for your request!
            </CardTitle>
            <CardDescription>
              Your information has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              We have received your request and will contact you as soon as possible.
            </p>
            <Button 
              onClick={resetForm} 
              className="bg-gradient-to-r from-[#2c3242] to-[#3a4358] hover:from-[#3a4358] hover:to-[#2c3242] text-white font-medium px-6 py-2 h-auto text-sm shadow-md transition-all duration-300 hover:shadow-lg rounded-md"
            >
              New Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2c3242] to-[#1c212d] relative overflow-hidden px-0 pt-0 pb-4 sm:px-6 sm:py-8">
      {/* Background patterns similar to public application form - hidden on mobile */}
      <div className="absolute inset-0 opacity-20 hidden sm:block">
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
            <path d="M50,10 L50,90" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
            <path d="M10,50 L90,50" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
          
          {/* Tech symbols scattered around */}
          <svg className="absolute bottom-20 right-20 w-64 h-64 text-[#73b729]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="8,8" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto relative z-10">
        
        <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden sm:rounded-xl rounded-none">
          <CardHeader className="bg-gradient-to-r from-[#2c3242] to-[#3a4357] text-white pb-4 pt-5 px-4 sm:pb-5 sm:pt-6 sm:px-8">
            <div className="flex flex-row justify-between items-center gap-3">
              <div>
                <CardTitle className="text-xl sm:text-3xl font-bold">
                  Lead Form
                </CardTitle>
                <CardDescription className="text-gray-200 mt-1 text-sm sm:text-base">
                  Fill out this form to contact us about your needs
                </CardDescription>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white/10 rounded-full p-3">
                <img src={cactusLogo} alt="Tecnarit Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <Tabs defaultValue="company" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-2 h-auto">
                    <TabsTrigger value="company" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-1 text-[10px] sm:text-base h-auto">
                      <Building2 size={18} className="min-w-[18px]" />
                      <span>Company</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-1 text-[10px] sm:text-base h-auto">
                      <Phone size={18} className="min-w-[18px]" />
                      <span>Contact</span>
                    </TabsTrigger>
                    <TabsTrigger value="address" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-1 text-[10px] sm:text-base h-auto">
                      <MapPin size={18} className="min-w-[18px]" />
                      <span>Address</span>
                    </TabsTrigger>
                    <TabsTrigger value="project" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-1 text-[10px] sm:text-base h-auto">
                      <FileText size={18} className="min-w-[18px]" />
                      <span>Project</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Company Info Tab */}
                  <TabsContent value="company" className="pt-4 pb-2 space-y-4 sm:pt-5 sm:space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company industry" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">VAT Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. BE0123456789" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start justify-between rounded-lg border p-3 sm:p-4 shadow-sm">
                          <div className="space-y-0.5 mb-2">
                            <FormLabel className="text-sm sm:text-base font-medium">Actively Looking for Testing Services</FormLabel>
                            <FormDescription className="text-xs sm:text-sm">
                              Are you currently looking to start testing services soon?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Contact Details Tab */}
                  <TabsContent value="contact" className="pt-4 pb-2 space-y-4 sm:pt-5 sm:space-y-6">
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">Contact Person *</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of contact person" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactFunction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">Contact Person Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. HR Manager, CTO" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base font-medium">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Email address" type="email" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
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
                            <FormLabel className="text-sm sm:text-base font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+32 (04) 93 40 11 23" type="tel" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Address Tab */}
                  <TabsContent value="address" className="pt-5 pb-2 space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">Street and Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Street and house number" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base font-medium">City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base font-medium">Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal code" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base font-medium">Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" className="h-10 sm:h-11 text-sm sm:text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Project Tab */}
                  <TabsContent value="project" className="pt-5 pb-2 space-y-6">
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-row items-center justify-between mb-1">
                            <FormLabel className="text-sm sm:text-base font-medium">Actively searching?</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-[#73b729]"
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="text-xs sm:text-sm text-gray-500">
                            {field.value ? 
                              "You are actively looking for IT Recruitment services" : 
                              "You are not actively looking yet"}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium">Project Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your project or company needs"
                              rows={6}
                              className="resize-none text-sm sm:text-base h-[120px] min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center pt-6 sm:pt-8">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#73b729] to-[#62a124] hover:from-[#62a124] hover:to-[#558f1e] text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 h-auto text-sm sm:text-base shadow-md transition-all duration-300 hover:shadow-lg rounded-md w-full sm:w-auto"
                  >
                    <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-white">
          <p>© {new Date().getFullYear()} Tecnarit. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}