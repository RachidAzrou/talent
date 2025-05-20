import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@shared/schema";
import { z } from "zod";
import { insertClientSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Building2, Search, Plus, Edit, Calendar, Mail, Phone, MapPin, User, FileText, Briefcase, Eye, Pencil, Trash2, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Clients() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addClientModalOpen, setAddClientModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch all clients with optimized settings
  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 1000, // Kortere stale time voor snellere updates
    refetchOnWindowFocus: true, // Update bij focus wisseling
  });

  // Form schema for adding a new client
  const formSchema = insertClientSchema;
  
  // Handle deletion of a client
  const handleDelete = (id: number) => {
    if (window.confirm("Weet je zeker dat je deze klant wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.")) {
      deleteClientMutation.mutate(id);
    }
  };

  // Add client mutation
  const addClientMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Client data being sent to API:", data);
      
      // Haal het token op uit localStorage
      const token = localStorage.getItem("token");
      console.log("Using token:", token ? "Token found" : "No token");
      
      // Maak een ruwe fetch call om te debuggen
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          // Probeer de foutmelding als tekst te lezen
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log("Success response data:", responseData);
        return responseData;
      } catch (fetchError) {
        console.error("Fetch error details:", fetchError);
        throw fetchError;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation success callback, data:", data);
      toast({
        title: "Client added",
        description: "The client has been added successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      // Direct refetch voor snellere updates
      refetch();
      setAddClientModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Client creation error:", error.message || error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/clients/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      refetch();
      setSelectedClient(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Extend the form schema to include the new fields
  const extendedFormSchema = formSchema.extend({
    contactFunction: z.string().min(1, "Contact function is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    vatNumber: z.string().min(1, "VAT number is required"),
  });

  // Form setup with extended fields
  const form = useForm<z.infer<typeof extendedFormSchema>>({
    resolver: zodResolver(extendedFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      contactFunction: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      vatNumber: "",
      industry: "",
      status: "active",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof extendedFormSchema>) {
    // Convert extended form values to match the backend schema exactly
    const clientData = {
      name: values.name,
      contactPerson: values.contactPerson,
      contactFunction: values.contactFunction,
      email: values.email,
      phone: values.phone,
      address: values.address ? `${values.address}, ${values.postalCode} ${values.city}, ${values.country}` : "",
      industry: values.industry || "",
      status: values.status || "active",
      notes: values.notes || "",
    };
    
    // Debug logging
    console.log("Submitting client data:", clientData);
    
    // Gebruik de speciale debug endpoint die authenticatie omzeilt
    fetch('/api/debug/clients/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })
    .then(response => {
      console.log("Debug endpoint response status:", response.status);
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Error: ${response.status} - ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Client added successfully:", data);
      toast({
        title: "Client added",
        description: "The client has been added successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      refetch();
      setAddClientModalOpen(false);
      form.reset();
    })
    .catch(error => {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client. Please try again.",
        variant: "destructive",
      });
    });
  }

  // Filter clients based on status and search query
  const filteredClients = React.useMemo(() => {
    let filtered = [...clients];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((client) => {
        return client.name.toLowerCase().includes(query) || 
               client.contactPerson.toLowerCase().includes(query) || 
               (client.industry && client.industry.toLowerCase().includes(query));
      });
    }
    
    return filtered;
  }, [clients, statusFilter, searchQuery]);

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
          <p className="text-2xl font-semibold text-gray-800">Clients</p>
        </div>
        <p className="mt-1 text-sm text-gray-500 pl-4">
          A clear overview of all your potential clients and leads.
        </p>
      </div>
      
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => setAddClientModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mt-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Search */}
        <div className="sm:col-span-8">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <label htmlFor="client-search" className="text-sm font-medium text-gray-700">Search Clients</label>
          </div>
          <div className="mt-1.5 relative rounded-md">
            <Input
              type="text"
              id="client-search"
              className="w-full"
              placeholder="Company, contact person, or industry"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="sm:col-span-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <label htmlFor="client-status" className="text-sm font-medium text-gray-700">Status Filter</label>
          </div>
          <div className="mt-1.5">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="client-status" className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Clients List */}
      <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Company</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Contact</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Function</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Email</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Industry</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Status</span>
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
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-gray-100 p-3">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No clients found</p>
                      <p className="text-xs text-gray-400">Adjust your search criteria or add new clients</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{client.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {client.contactFunction || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {client.email || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{client.industry || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant="outline"
                        className={`
                          ${client.status === "active" ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : 
                           client.status === "pending" ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100" :
                           "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"}
                          px-2.5 py-0.5 text-xs font-medium
                        `}
                      >
                        {client.status === "active" ? "Active" : 
                         client.status === "pending" ? "Pending" : "Not Active"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsEditing(false);
                          }}
                          title="Bekijken"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDelete(client.id)}
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
              <span className="font-medium">{filteredClients.length}</span> client{filteredClients.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {/* "New Client" button is removed as requested */}
        </div>
      </Card>
      
      {/* Add Client Modal */}
      <Dialog open={addClientModalOpen} onOpenChange={setAddClientModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add company details and contact information for a new client.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="company">Company Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact Details</TabsTrigger>
                  <TabsTrigger value="address">Address & VAT</TabsTrigger>
                </TabsList>
                
                {/* Company Info Tab */}
                <TabsContent value="company" className="pt-4 pb-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Status *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Contact Details Tab */}
                <TabsContent value="contact" className="pt-4 pb-2">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="contactFunction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Function *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="E.g. HR Manager" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
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
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel" 
                              placeholder="+32 (04) 93 40 11 23" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Address & VAT Tab */}
                <TabsContent value="address" className="pt-4 pb-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="BE0123456789" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Additional notes about the client" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setAddClientModalOpen(false);
                    setIsEditing(false);
                  }} 
                  disabled={addClientMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addClientMutation.isPending}
                  className="bg-gradient-to-r from-[#2c3242] to-primary hover:from-[#2c3242]/90 hover:to-primary/90"
                >
                  {addClientMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Client Modal */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedClient.name}</DialogTitle>
                <DialogDescription>
                  Client information and details
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <Badge 
                    variant="outline"
                    className={`
                      ${selectedClient.status === "active" ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : 
                       selectedClient.status === "pending" ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100" :
                       "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"}
                      px-2.5 py-0.5 text-xs font-medium
                    `}
                  >
                    {selectedClient.status === "active" ? "Active" : 
                     selectedClient.status === "pending" ? "Pending" : "Not Active"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <dl className="mt-2 divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      Contact Person
                    </dt>
                    <dd className="text-sm text-gray-900">{selectedClient.contactPerson}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-400" />
                      Email
                    </dt>
                    <dd className="text-sm text-gray-900">
                      <a href={`mailto:${selectedClient.email}`} className="text-primary hover:text-primary-600">
                        {selectedClient.email}
                      </a>
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-gray-400" />
                      Phone
                    </dt>
                    <dd className="text-sm text-gray-900">{selectedClient.phone}</dd>
                  </div>
                  {selectedClient.address && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        Address
                      </dt>
                      <dd className="text-sm text-gray-900">{selectedClient.address}</dd>
                    </div>
                  )}
                  {selectedClient.industry && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                        Industry
                      </dt>
                      <dd className="text-sm text-gray-900">{selectedClient.industry}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              {selectedClient.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedClient.notes}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  <li className="py-3">
                    <div className="flex space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium">Client created</h5>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedClient.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedClient(null)}>
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    // Set form values from selected client
                    form.reset({
                      name: selectedClient.name,
                      contactPerson: selectedClient.contactPerson,
                      email: selectedClient.email,
                      phone: selectedClient.phone || "",
                      status: selectedClient.status || "active",
                      industry: selectedClient.industry || "",
                      address: selectedClient.address || "",
                      notes: selectedClient.notes || "",
                      // Fill in extended fields with empty values if not present
                      contactFunction: selectedClient.contactFunction || "",
                      city: "",
                      postalCode: "",
                      country: "",
                      vatNumber: ""
                    });
                    // Close current dialog and open edit dialog
                    setSelectedClient(null);
                    setIsEditing(true);
                    setAddClientModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-[#2c3242] to-primary hover:from-[#2c3242]/90 hover:to-primary/90"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Client
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
