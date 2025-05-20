import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  InboxIcon,
  Award,
  UserPlus,
  CheckCircle,
  XCircle,
  FileBarChart,
  Building2,
} from "lucide-react";
import { BusinessIcon } from "@/assets/icons";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, iconBg, iconColor, href }) => (
  <Card className="bg-white rounded-lg shadow">
    <CardContent className="p-6 flex items-center">
      <div className={`${iconBg} p-3 rounded-full mr-4`}>
        <div className={`${iconColor} text-2xl`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

interface ActivityItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, iconBg, title, description, time }) => (
  <div className="flex">
    <div className="flex-shrink-0 mr-4">
      <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  bg: string;
  textColor: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, href, bg, textColor }) => (
  <Link href={href}>
    <a className={`w-full flex items-center justify-between p-4 ${bg} ${textColor} rounded-lg hover:bg-opacity-90 transition`}>
      <span className="flex items-center">
        {icon}
        <span className="ml-3">{title}</span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  </Link>
);

export default function Dashboard() {
  // Fetch count data
  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/applications'],
    select: (data) => data.filter((app: any) => app.status === 'pending')
  });
  
  const { data: candidatesData, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['/api/candidates'],
    select: (data) => data.filter((candidate: any) => candidate.status === 'active')
  });
  
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    select: (data) => data.filter((client: any) => client.status === 'active')
  });

  return (
    <div>
      {/* Dashboard Title - Only visible on desktop */}
      <div className="mb-6 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-[#73b729] to-green-400 rounded-full"></div>
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 pl-4">
          Overview of your recruitment operations and key metrics.
        </p>
      </div>

      {/* Mobile Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6 md:hidden">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Pending Admissions"
          value={isLoadingApplications ? 0 : applicationsData?.length || 0}
          icon={<InboxIcon />}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
          href="/admissions"
        />
        
        <StatsCard
          title="Active Candidates"
          value={isLoadingCandidates ? 0 : candidatesData?.length || 0}
          icon={<Users />}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
          href="/candidates"
        />
        
        <StatsCard
          title="Active Clients"
          value={isLoadingClients ? 0 : clientsData?.length || 0}
          icon={<Building2 />}
          iconBg="bg-green-100"
          iconColor="text-green-500"
          href="/clients"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity */}
        <Card className="bg-white rounded-lg shadow">
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle className="font-heading text-xl font-semibold text-gray-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingApplications || isLoadingCandidates || isLoadingClients ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#73b729]"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* If we have applications, show the most recent one */}
                {applicationsData && applicationsData.length > 0 && (
                  <ActivityItem
                    icon={<UserPlus className="text-primary-600" />}
                    iconBg="bg-primary-100"
                    title="New candidate application received"
                    description={`${applicationsData[0].firstName} ${applicationsData[0].lastName} applied for a position`}
                    time={new Date(applicationsData[0].createdAt).toLocaleString()}
                  />
                )}
                
                {/* Candidate data - most recent approved */}
                {candidatesData && candidatesData.length > 0 && (
                  <ActivityItem
                    icon={<CheckCircle className="text-green-600" />}
                    iconBg="bg-green-100"
                    title="Active candidate"
                    description={`${candidatesData[0].firstName} ${candidatesData[0].lastName} - ${candidatesData[0].profile || 'Developer'}`}
                    time={candidatesData[0].updatedAt ? new Date(candidatesData[0].updatedAt).toLocaleString() : 'Recently added'}
                  />
                )}
                
                {/* Client data - show most recent */}
                {clientsData && clientsData.length > 0 && (
                  <ActivityItem
                    icon={<Building2 className="text-blue-600" />}
                    iconBg="bg-blue-100"
                    title="Active client"
                    description={`${clientsData[0].name} - ${clientsData[0].industry || 'Technology'}`}
                    time={clientsData[0].createdAt ? new Date(clientsData[0].createdAt).toLocaleString() : 'Recently added'}
                  />
                )}
                
                {/* If no activity is available */}
                {(!applicationsData || applicationsData.length === 0) &&
                 (!candidatesData || candidatesData.length === 0) &&
                 (!clientsData || clientsData.length === 0) && (
                  <div className="text-center py-10 text-gray-500">
                    <InboxIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No recent activity to display</p>
                    <p className="text-sm mt-2">Activities will appear here as you work with the system</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
