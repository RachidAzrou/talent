import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  LayoutDashboard, 
  Inbox as InboxIcon, 
  Users, 
  FileSymlink,
  Briefcase, 
  FileText, 
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle,
  Calendar,
  Key,
  Pencil,
  ExternalLink,
  Globe,
  Building2,
} from "lucide-react";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  subItems?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
  }[];
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Admissions", path: "/admissions", icon: <InboxIcon size={20} /> },
  { 
    name: "Candidates", 
    path: "/candidates", 
    icon: <Users size={20} />,
    subItems: [
      { name: "Application Form", path: "/apply", icon: <FileText size={16} /> }
    ]
  },
  { 
    name: "Clients", 
    path: "/clients", 
    icon: <Building2 size={20} />,
    subItems: [
      { name: "Lead Form", path: "/public-lead-form", icon: <FileText size={16} /> }
    ]
  },

  { name: "CV Template", path: "/cv-template", icon: <FileSymlink size={20} />, adminOnly: true },
  { name: "Settings", path: "/settings", icon: <Settings size={20} />, adminOnly: true },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentMenuItem = menuItems.find(item => item.path === location);
    return currentMenuItem?.name || "Dashboard";
  };

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Preserve sidebar state during navigation
  useEffect(() => {
    // Get saved sidebar state from localStorage or default to true for desktop
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setIsSidebarOpen(savedSidebarState === 'true');
    } else if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [location, isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    // Save state in localStorage
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  const userInitials = user 
    ? (user.firstName && user.lastName 
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : user.email ? user.email.charAt(0).toUpperCase() : "U")
    : "U";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar navigation for desktop */}
      <aside
        className={`bg-[#2c3242] text-white fixed md:sticky top-0 z-30 h-screen transition-all duration-300 ease-in-out transform ${
          isSidebarOpen 
            ? "translate-x-0 w-72 md:w-64" 
            : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
        style={{ height: "100vh", overflowY: "auto" }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
          <div className="flex items-center">
            {isSidebarOpen ? (
              <Logo className="text-white" useFullLogo={true} />
            ) : (
              <div className="hidden md:flex justify-center items-center h-10 w-10">
                <Logo compact showText={false} />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none hidden md:flex"
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="py-4">
          <div className="px-3 space-y-1">
            {menuItems.map(item => {
              // Only show admin-only items to admins
              if (item.adminOnly && (!user || user.role !== 'admin')) {
                return null;
              }
              
              return (
                <div key={item.path}>
                  <Link href={item.path}>
                    <a 
                      className={`flex items-center w-full px-3 py-2 rounded-md transition duration-150 ease-in-out ${
                        location === item.path 
                          ? "bg-[#73b729] text-white" 
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <span className={!isSidebarOpen ? "md:hidden" : ""}>{item.name}</span>
                    </a>
                  </Link>
                  
                  {/* Show subitems if they exist and sidebar is open */}
                  {item.subItems && isSidebarOpen && (
                    <div className="ml-10 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link key={subItem.path} href={subItem.path}>
                          <a 
                            className={`flex items-center w-full px-3 py-1 text-sm rounded-md transition duration-150 ease-in-out ${
                              location === subItem.path 
                                ? "bg-[#73b729]/80 text-white" 
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                          >
                            {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                            <span>{subItem.name}</span>
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto border-t border-gray-800 px-4 py-4">
          <button 
            onClick={logout} 
            className="flex items-center w-full text-gray-300 hover:text-white"
          >
            <LogOut className="text-xl mr-3" />
            <span className={!isSidebarOpen ? "md:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top navigation */}
        <header className="bg-white border-b border-gray-200 z-20">
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
            {/* Mobile menu toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#2c3242] text-white p-0">
                <div className="px-4 py-5 border-b border-gray-800">
                  <Logo className="text-white" useFullLogo={true} compact={false} />
                </div>
                <nav className="py-4">
                  <div className="px-3 space-y-1">
                    {menuItems.map(item => (
                      <div key={item.path}>
                        <Link href={item.path}>
                          <a 
                            className={`flex items-center w-full px-3 py-2 rounded-md transition duration-150 ease-in-out ${
                              location === item.path 
                                ? "bg-[#73b729] text-white" 
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-xl mr-3">{item.icon}</span>
                            <span>{item.name}</span>
                          </a>
                        </Link>
                        
                        {/* Show subItems in mobile menu */}
                        {item.subItems && (
                          <div className="ml-10 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Link key={subItem.path} href={subItem.path}>
                                <a 
                                  className={`flex items-center w-full px-3 py-1 text-sm rounded-md transition duration-150 ease-in-out ${
                                    location === subItem.path 
                                      ? "bg-[#73b729]/80 text-white" 
                                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                                  <span>{subItem.name}</span>
                                </a>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </nav>
                <div className="mt-auto border-t border-gray-800 px-4 py-4">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full text-gray-300 hover:text-white"
                  >
                    <LogOut className="text-xl mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Space that replaces the title */}
            <div className="hidden md:block w-48"></div>
            
            {/* Space between title and profile section */}
            <div className="hidden md:block ml-6 lg:ml-auto lg:mr-auto w-full max-w-md"></div>
            
            {/* User Profile & Settings */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <h3 className="font-medium text-sm">Notifications</h3>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="py-2">
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-100 p-2">
                            <UserPlus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">New candidate application</p>
                            <p className="text-xs text-gray-500">John Doe has applied for Developer position</p>
                            <p className="text-xs text-gray-400">Just now</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-100 p-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Client status updated</p>
                            <p className="text-xs text-gray-500">Acme Inc. is now marked as Active</p>
                            <p className="text-xs text-gray-400">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-amber-100 p-2">
                            <Calendar className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Interview scheduled</p>
                            <p className="text-xs text-gray-500">Interview with Jane Smith at 2:00 PM tomorrow</p>
                            <p className="text-xs text-gray-400">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="border-t border-gray-200 px-4 py-2">
                    <Link href="/notifications">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center text-sm text-blue-600"
                      >
                        View all notifications
                      </Button>
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* User Profile Dialog with Tabs */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="flex items-center focus:outline-none">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-green-400 text-white font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2c3242] to-[#3c4252] p-6 pb-8 text-white relative">
                    <button 
                      className="absolute top-2 right-2 rounded-full p-1.5 bg-white/20 hover:bg-white/30 transition-colors text-white"
                      onClick={() => {
                        const closeButton = document.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLElement;
                        if (closeButton) closeButton.click();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-white/30">
                          <AvatarFallback className="text-lg bg-gradient-to-br from-[#73b729] to-green-400 text-white font-medium">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#73b729] flex items-center justify-center border-2 border-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-white/80 text-sm">{user?.email}</p>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#73b729] text-white">
                            HR Manager
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="profile" className="w-full">
                    <div className="px-6 border-b">
                      <TabsList className="grid grid-cols-3 my-4 bg-gray-100/80 p-1 rounded-xl">
                        <TabsTrigger 
                          value="profile" 
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#73b729]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          Profile
                        </TabsTrigger>
                        <TabsTrigger 
                          value="security" 
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#73b729]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Security
                        </TabsTrigger>
                        <TabsTrigger 
                          value="settings" 
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#73b729]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          Settings
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="profile" className="p-6 pt-4 focus:outline-none">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-medium text-[#2c3242] mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#73b729]">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium uppercase text-gray-500">First Name</label>
                              <div className="p-3 bg-white border rounded-md shadow-sm">
                                <p className="text-sm font-medium text-gray-800">{user?.firstName || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium uppercase text-gray-500">Last Name</label>
                              <div className="p-3 bg-white border rounded-md shadow-sm">
                                <p className="text-sm font-medium text-gray-800">{user?.lastName || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium uppercase text-gray-500">Email</label>
                              <div className="p-3 bg-white border rounded-md shadow-sm">
                                <p className="text-sm font-medium text-gray-800">{user?.email || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium uppercase text-gray-500">Function</label>
                              <div className="p-3 bg-white border rounded-md shadow-sm">
                                <p className="text-sm font-medium text-gray-800">HR Manager</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button className="bg-gradient-to-r from-[#73b729] to-green-500 hover:from-[#68a625] hover:to-green-600 text-white border-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                            Edit Profile Details
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="security" className="p-6 pt-4 focus:outline-none">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-medium text-[#2c3242] mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#73b729]">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Password Management
                          </h3>
                          <div className="bg-white p-4 rounded-md border shadow-sm mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-800">Current Password Status</p>
                                <p className="text-xs text-gray-500 mt-1">Last changed 30 days ago</p>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Strong
                              </span>
                            </div>
                          </div>
                          <Button className="w-full bg-white hover:bg-gray-50 text-[#2c3242] border border-gray-300 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                              <path d="M12.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Change Password
                          </Button>
                        </div>
                        

                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="p-6 pt-4 focus:outline-none">
                      <div className="space-y-6">

                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-medium text-[#2c3242] mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#73b729]">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" x2="12" y1="8" y2="12"/>
                              <line x1="12" x2="12.01" y1="16" y2="16"/>
                            </svg>
                            Language &amp; Region
                          </h3>
                          <div className="bg-white p-4 rounded-md border shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-medium uppercase text-gray-500">Language</label>
                                <select className="w-full p-2 text-sm border rounded-md bg-gray-50">
                                  <option value="en">English</option>
                                  <option value="nl">Dutch</option>
                                  <option value="fr">French</option>
                                  <option value="de">German</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium uppercase text-gray-500">Time Zone</label>
                                <select className="w-full p-2 text-sm border rounded-md bg-gray-50">
                                  <option value="europe-brussels">Europe/Brussels (GMT+1)</option>
                                  <option value="europe-london">Europe/London (GMT+0)</option>
                                  <option value="america-new_york">America/New_York (GMT-5)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="p-4 border-t flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="text-sm text-gray-600">
                      Logged in as <span className="font-medium text-[#2c3242]">{user?.email}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={logout} 
                      className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}