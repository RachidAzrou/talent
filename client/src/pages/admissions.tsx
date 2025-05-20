import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Application } from "@shared/schema";
import { PDFDownloadButton } from "@/components/pdf/CandidateTemplate";
import { generateCandidateData } from "@/lib/pdf";
import { CompanyLogoPlaceholder } from "@/assets/icons";

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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, Phone, Search, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";

export default function Admissions() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { toast } = useToast();
  
  // Handle approve action
  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };
  
  // Handle reject action
  const handleReject = (id: number) => {
    rejectMutation.mutate(id);
  };
  
  // Handle delete action
  const handleDelete = (id: number) => {
    if (window.confirm("Weet je zeker dat je deze aanvraag wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.")) {
      deleteMutation.mutate(id);
    }
  };

  // Delete mutation  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/applications/${id}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch all applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/applications'],
  });

  // Approve application mutation
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/applications/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application approved",
        description: "The candidate has been added to your candidates list.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      setSelectedApplication(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/applications/${id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application rejected",
        description: "The application has been rejected.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setSelectedApplication(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter applications based on status and sort order
  const filteredApplications = React.useMemo(() => {
    let filtered = [...applications];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.firstName.localeCompare(b.firstName);
      }
    });
  }, [applications, statusFilter, sortBy]);

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
          <p className="text-2xl font-semibold text-gray-800">Admissions</p>
        </div>
        <p className="mt-1 text-sm text-gray-500 pl-4">
          Here you'll find all incoming applications. Review, approve, or reject candidates.
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort By: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort By: Newest</SelectItem>
                <SelectItem value="oldest">Sort By: Oldest</SelectItem>
                <SelectItem value="name">Sort By: Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Candidate</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Applied Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-gray-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">No applications found</p>
                      <p className="text-xs text-gray-400">Applications will appear here once candidates complete the form</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Avatar className="border border-gray-200">
                            <AvatarFallback className="bg-[#73b729]/10 text-[#2c3242] font-medium">
                              {application.firstName[0] + application.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {application.firstName} {application.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-medium">{application.currentPosition || "Not specified"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {format(new Date(application.createdAt), 'dd MMM yyyy')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(application.createdAt), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant="outline"
                        className={`
                          ${application.status === "approved" ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : 
                            application.status === "rejected" ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : 
                            "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}
                          px-2.5 py-0.5 text-xs font-medium
                        `}
                      >
                        {application.status === "pending" ? "Pending Review" :
                         application.status === "approved" ? "Approved" :
                         "Rejected"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => setSelectedApplication(application)}
                          title="Bekijken"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.status === "pending" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                              onClick={() => handleApprove(application.id)}
                              title="Goedkeuren"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                              onClick={() => handleReject(application.id)}
                              title="Afwijzen"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDelete(application.id)}
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
              <span className="font-medium">{filteredApplications.length}</span> application{filteredApplications.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled className="border-gray-200 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled className="border-gray-200 text-gray-400">
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Candidate Application</DialogTitle>
            <DialogDescription>
              Review the application details before making a decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="md:w-1/3 mb-6 md:mb-0">
                {/* Candidate Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarFallback className="text-lg">
                        {selectedApplication.firstName[0] + selectedApplication.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {selectedApplication.firstName} {selectedApplication.lastName}
                      </h4>
                      <p className="text-gray-600">{selectedApplication.currentPosition || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="text-sm text-gray-700">{selectedApplication.email}</span>
                    </div>
                    {selectedApplication.phone && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm text-gray-700">{selectedApplication.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Application Status */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Application Status</h4>
                  <div className="mb-4">
                    <Badge variant={
                      selectedApplication.status === "approved" ? "success" :
                      selectedApplication.status === "rejected" ? "destructive" :
                      "warning"
                    }>
                      {selectedApplication.status === "pending" ? "Pending Review" :
                       selectedApplication.status === "approved" ? "Approved" :
                       "Rejected"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Applied on {format(new Date(selectedApplication.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {selectedApplication.status === "pending" && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => approveMutation.mutate(selectedApplication.id)}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? "Processing..." : "Approve Candidate"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => rejectMutation.mutate(selectedApplication.id)}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? "Processing..." : "Reject Candidate"}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* PDF Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Resume Preview</h4>
                  <div className="border border-gray-300 rounded-md bg-white p-2 mb-3 h-48 flex items-center justify-center">
                    {/* PDF Preview Placeholder */}
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-gray-500">
                        {selectedApplication.firstName} {selectedApplication.lastName} - Application.pdf
                      </p>
                    </div>
                  </div>
                  <PDFDownloadButton 
                    data={generateCandidateData(selectedApplication)}
                    companyLogo="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSIjM2I4MmY2Ii8+CiAgPHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEFMRU5URk9SR0U8L3RleHQ+Cjwvc3ZnPgo="
                    fileName={`${selectedApplication.firstName.toLowerCase()}_${selectedApplication.lastName.toLowerCase()}_application.pdf`}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Resume
                  </PDFDownloadButton>
                </div>
              </div>
              
              <div className="md:w-2/3">
                {/* Candidate Details */}
                <div className="bg-white rounded-lg">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <p className="text-gray-900">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <p className="text-gray-900">{selectedApplication.email}</p>
                      </div>
                      {selectedApplication.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <p className="text-gray-900">{selectedApplication.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Professional Information</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Applying For</label>
                      <p className="text-gray-900">{selectedApplication.currentPosition || "Not specified"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <p className="text-gray-900 whitespace-pre-line">{selectedApplication.experience}</p>
                    </div>
                    {selectedApplication.education && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                        <p className="text-gray-900 whitespace-pre-line">{selectedApplication.education}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedApplication.skills) && selectedApplication.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedApplication.coverLetter && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Cover Letter</h4>
                      <div className="prose max-w-none text-gray-600">
                        <p className="whitespace-pre-line">{selectedApplication.coverLetter}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
