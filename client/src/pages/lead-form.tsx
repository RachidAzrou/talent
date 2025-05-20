import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

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
import { Briefcase, CheckCircle, Building } from "lucide-react";

// Lead form schema
const leadFormSchema = z.object({
  name: z.string().min(2, { message: "Company name is required" }),
  contactPerson: z.string().min(2, { message: "Contact person is required" }),
  contactFunction: z.string().optional(),
  email: z.string().email({ message: "Valid email address is required" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  industry: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  interestArea: z.string().min(1, { message: "Please select an area of interest" }),
  projectDescription: z.string().min(10, { message: "Please provide a brief description of your project or needs" })
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

// Interest areas
const interestAreas = [
  "Software Development",
  "Web Development",
  "Mobile Development",
  "Automation",
  "DevOps",
  "Quality Assurance",
  "UI/UX Design",
  "IT Consultancy",
  "Cloud Solutions",
  "Other"
];

export default function LeadForm() {
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      contactFunction: "",
      email: "",
      phone: "",
      industry: "",
      address: "",
      notes: "",
      interestArea: "",
      projectDescription: ""
    }
  });

  // Check if the user is an admin, if not, show access denied
  const isAdmin = user?.role === "admin";

  const onSubmit = async (data: LeadFormValues) => {
    try {
      // Convert the form data to match client schema
      const clientData = {
        name: data.name,
        contactPerson: data.contactPerson,
        contactFunction: data.contactFunction || null,
        email: data.email,
        phone: data.phone,
        industry: data.industry || null,
        address: data.address || null,
        notes: `Interest Area: ${data.interestArea}\n\nProject Description: ${data.projectDescription}\n\n${data.notes || ""}`,
        status: "lead"
      };

      // Submit to clients endpoint
      await apiRequest("/api/clients", { 
        method: "POST", 
        body: JSON.stringify(clientData)
      });

      // Show success message
      toast({
        title: "Lead Added",
        description: "The lead information has been successfully saved.",
        variant: "default",
      });

      // Reset form
      form.reset();

      // Invalidate clients query to refresh the list
      queryClient.invalidateQueries({queryKey: ['/api/clients']});

    } catch (error) {
      console.error("Error submitting lead form:", error);
      toast({
        title: "An error occurred",
        description: "Something went wrong when saving the lead.",
        variant: "destructive",
      });
    }
  };

  // Public shareable link creation
  const getPublicFormUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public-lead-form`;
  };

  const copyLinkToClipboard = () => {
    const link = getPublicFormUrl();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "The public link has been copied to clipboard.",
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Access Denied</CardTitle>
            <CardDescription>
              You do not have access to this part of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is only accessible to administrators. Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2c3242] to-[#1c212d] relative overflow-hidden px-4 py-8">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-md border-t-4 border-t-[#73b729]">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-[#2c3242]">
                      Lead Form
                    </CardTitle>
                    <CardDescription>
                      Use this form to register potential client leads
                    </CardDescription>
                  </div>
                  <div className="bg-[#73b729]/10 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-[#73b729]" />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      {/* Company Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Industry */}
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an industry" />
                                </SelectTrigger>
                                <SelectContent>
                                  {industries.map((industry) => (
                                    <SelectItem key={industry} value={industry}>
                                      {industry}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Contact Person */}
                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Contact Function */}
                      <FormField
                        control={form.control}
                        name="contactFunction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Function</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact function" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address (full width) */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Interest Area */}
                      <FormField
                        control={form.control}
                        name="interestArea"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Area of Interest</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an area of interest" />
                                </SelectTrigger>
                                <SelectContent>
                                  {interestAreas.map((area) => (
                                    <SelectItem key={area} value={area}>
                                      {area}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Project Description */}
                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Project Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the project or client needs"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes or comments"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-[#73b729] hover:bg-[#62a124] text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Lead
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-md mb-6 border-t-4 border-t-[#2c3242]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-[#2c3242]">Public Link</CardTitle>
                  <div className="bg-[#2c3242]/10 p-3 rounded-full">
                    <Building className="h-5 w-5 text-[#2c3242]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Copy this link to share with potential clients who can fill out their information.
                </p>
                <div className="flex space-x-2">
                  <Input 
                    value={getPublicFormUrl()} 
                    readOnly 
                    className="bg-gray-50"
                  />
                  <Button 
                    onClick={copyLinkToClipboard}
                    variant="outline"
                    className="flex-shrink-0 border-[#73b729] text-[#73b729] hover:bg-[#73b729]/10"
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#2c3242]">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-[#2c3242]">Lead Registration</h4>
                  <p className="text-sm text-gray-600">
                    Use this form to register new business leads.
                    Submitted leads are saved as potential clients.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#2c3242]">What happens after registration?</h4>
                  <p className="text-sm text-gray-600">
                    Leads are automatically added to the client list with the status "lead".
                    They can later be updated to "active" when they become clients.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#2c3242]">Public Link</h4>
                  <p className="text-sm text-gray-600">
                    Share the public link with potential clients so they can fill out their information themselves.
                    This link is accessible without logging in.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}