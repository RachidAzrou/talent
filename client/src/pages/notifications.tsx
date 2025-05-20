import React, { useState } from "react";
import { 
  Check, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  Filter, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  Trash2, 
  UserPlus,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Types for our notifications
interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'application' | 'update' | 'meeting' | 'other';
  icon: React.ReactNode;
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New candidate application',
    description: 'John Doe has applied for Developer position',
    timestamp: 'Just now',
    isRead: false,
    type: 'application',
    icon: <UserPlus className="h-4 w-4 text-blue-600" />
  },
  {
    id: '2',
    title: 'Client status updated',
    description: 'Acme Inc. is now marked as Active',
    timestamp: '2 hours ago',
    isRead: false,
    type: 'update',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />
  },
  {
    id: '3',
    title: 'Interview scheduled',
    description: 'Interview with Jane Smith at 2:00 PM tomorrow',
    timestamp: 'Yesterday',
    isRead: true,
    type: 'meeting',
    icon: <Calendar className="h-4 w-4 text-amber-600" />
  },
  {
    id: '4',
    title: 'New candidate application',
    description: 'Sarah Johnson has applied for UX Designer position',
    timestamp: '2 days ago',
    isRead: true,
    type: 'application',
    icon: <UserPlus className="h-4 w-4 text-blue-600" />
  },
  {
    id: '5',
    title: 'Client feedback received',
    description: 'TechCorp has provided feedback on candidates',
    timestamp: '3 days ago',
    isRead: true,
    type: 'update',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />
  },
  {
    id: '6',
    title: 'Interview rescheduled',
    description: 'Interview with Tom Brown moved to Friday at 10:00 AM',
    timestamp: '4 days ago',
    isRead: true,
    type: 'meeting',
    icon: <Calendar className="h-4 w-4 text-amber-600" />
  },
  {
    id: '7',
    title: 'New candidate application',
    description: 'Michael Williams has applied for Senior Developer position',
    timestamp: '5 days ago',
    isRead: true,
    type: 'application',
    icon: <UserPlus className="h-4 w-4 text-blue-600" />
  },
  {
    id: '8',
    title: 'System maintenance completed',
    description: 'All system maintenance has been completed successfully',
    timestamp: '1 week ago',
    isRead: true,
    type: 'other',
    icon: <RefreshCw className="h-4 w-4 text-gray-600" />
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();

  // Filtering notifications based on type and read status
  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      // Filter by search query
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by type
      const matchesType = filterType === 'all' || notification.type === filterType;
      
      // Filter by read status based on selected tab
      return matchesSearch && matchesType;
    });
  };

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  // Get read notifications
  const readNotifications = notifications.filter(n => n.isRead);

  // Toggle selection of all notifications
  const toggleSelectAll = (notificationsToSelect: Notification[]) => {
    if (selectedNotifications.length === notificationsToSelect.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notificationsToSelect.map(n => n.id));
    }
  };

  // Toggle selection of a single notification
  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Mark selected notifications as read
  const markAsRead = () => {
    const updatedNotifications = notifications.map(notification => 
      selectedNotifications.includes(notification.id) 
        ? { ...notification, isRead: true } 
        : notification
    );
    setNotifications(updatedNotifications);
    
    toast({
      title: "Notifications marked as read",
      description: `${selectedNotifications.length} notification(s) marked as read.`,
    });
    
    setSelectedNotifications([]);
  };

  // Mark selected notifications as unread
  const markAsUnread = () => {
    const updatedNotifications = notifications.map(notification => 
      selectedNotifications.includes(notification.id) 
        ? { ...notification, isRead: false } 
        : notification
    );
    setNotifications(updatedNotifications);
    
    toast({
      title: "Notifications marked as unread",
      description: `${selectedNotifications.length} notification(s) marked as unread.`,
    });
    
    setSelectedNotifications([]);
  };

  // Delete selected notifications
  const deleteNotifications = () => {
    const updatedNotifications = notifications.filter(
      notification => !selectedNotifications.includes(notification.id)
    );
    setNotifications(updatedNotifications);
    
    toast({
      title: "Notifications deleted",
      description: `${selectedNotifications.length} notification(s) deleted.`,
      variant: "destructive",
    });
    
    setSelectedNotifications([]);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-[#73b729] to-green-400 rounded-full"></div>
            <p className="text-2xl font-semibold text-gray-800">Notifications</p>
          </div>
          <p className="mt-1 text-sm text-gray-500 pl-4">
            Manage all your notifications in one place
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setNotifications(mockNotifications)}
            className="bg-white border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 text-primary" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Actions for selected notifications */}
      {selectedNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-[#2c3242]/5 to-gray-50 p-4 rounded-md mb-6 border border-gray-200 flex flex-wrap gap-3 items-center justify-between shadow-sm">
          <div className="flex items-center">
            <div className="bg-[#73b729] h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
              {selectedNotifications.length}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {selectedNotifications.length === 1 ? 'item' : 'items'} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={markAsRead} className="bg-white border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Eye className="h-4 w-4 mr-2" />
              Mark as Read
            </Button>
            <Button size="sm" variant="outline" onClick={markAsUnread} className="bg-white border-gray-200 hover:bg-amber-50 hover:text-amber-600 transition-colors">
              <EyeOff className="h-4 w-4 mr-2" />
              Mark as Unread
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={deleteNotifications} 
              className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-primary/60" />
          </div>
          <Input
            type="text"
            placeholder="Search notifications..."
            className="pl-10 border-gray-200 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notification tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger 
            value="all" 
            className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <span className="flex items-center">
              All
              {notifications.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-gradient-to-r from-[#73b729] to-green-500 text-white text-xs"
                >
                  {notifications.length}
                </Badge>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <span className="flex items-center">
              Unread
              {unreadNotifications.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs"
                >
                  {unreadNotifications.length}
                </Badge>
              )}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* All notifications tab */}
        <TabsContent value="all">
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#2c3242] flex items-center">
                  <Check className="mr-2 h-5 w-5 text-[#73b729]" />
                  All Notifications
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-gray-100 text-gray-700"
                  onClick={() => toggleSelectAll(getFilteredNotifications())}
                >
                  {selectedNotifications.length === getFilteredNotifications().length 
                    ? "Deselect All" 
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Notification</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredNotifications().length > 0 ? (
                      getFilteredNotifications().map((notification) => (
                        <TableRow 
                          key={notification.id}
                          className={notification.isRead ? '' : 'bg-blue-50/50 hover:bg-blue-50'}
                        >
                          <TableCell className="p-2">
                            <Checkbox 
                              checked={selectedNotifications.includes(notification.id)}
                              onCheckedChange={() => toggleSelectNotification(notification.id)}
                              className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="rounded-full p-2 shadow-inner" style={{
                              backgroundColor: 
                                notification.type === 'application' ? 'rgba(59, 130, 246, 0.1)' :
                                notification.type === 'update' ? 'rgba(16, 185, 129, 0.1)' :
                                notification.type === 'meeting' ? 'rgba(245, 158, 11, 0.1)' :
                                'rgba(107, 114, 128, 0.1)'
                            }}>
                              {notification.icon}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={`font-medium ${!notification.isRead ? 'text-[#2c3242]' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!notification.isRead && (
                                <div className="h-2 w-2 rounded-full bg-[#73b729]"></div>
                              )}
                              <span className="text-sm text-gray-500">{notification.timestamp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  const updatedNotifications = notifications.map(n => 
                                    n.id === notification.id ? {...n, isRead: true} : n
                                  );
                                  setNotifications(updatedNotifications);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const updatedNotifications = notifications.map(n => 
                                    n.id === notification.id ? {...n, isRead: false} : n
                                  );
                                  setNotifications(updatedNotifications);
                                }}>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Mark as Unread
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setNotifications(notifications.filter(n => n.id !== notification.id));
                                  toast({
                                    title: "Notification deleted",
                                    description: "The notification has been removed.",
                                    variant: "destructive",
                                  });
                                }}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unread notifications tab */}
        <TabsContent value="unread">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Unread Notifications</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSelectAll(unreadNotifications.filter(n => 
                    (filterType === 'all' || n.type === filterType) &&
                    (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     n.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  ))}
                >
                  {selectedNotifications.length === unreadNotifications.filter(n => 
                    (filterType === 'all' || n.type === filterType) &&
                    (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     n.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length 
                    ? "Deselect All" 
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Notification</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unreadNotifications.filter(n => 
                      (filterType === 'all' || n.type === filterType) &&
                      (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       n.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).length > 0 ? (
                      unreadNotifications.filter(n => 
                        (filterType === 'all' || n.type === filterType) &&
                        (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      ).map((notification) => (
                        <TableRow 
                          key={notification.id}
                          className="bg-blue-50"
                        >
                          <TableCell className="p-2">
                            <Checkbox 
                              checked={selectedNotifications.includes(notification.id)}
                              onCheckedChange={() => toggleSelectNotification(notification.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="rounded-full p-2" style={{
                              backgroundColor: 
                                notification.type === 'application' ? 'rgba(59, 130, 246, 0.1)' :
                                notification.type === 'update' ? 'rgba(16, 185, 129, 0.1)' :
                                notification.type === 'meeting' ? 'rgba(245, 158, 11, 0.1)' :
                                'rgba(107, 114, 128, 0.1)'
                            }}>
                              {notification.icon}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-gray-500">{notification.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-gray-500">{notification.timestamp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  const updatedNotifications = notifications.map(n => 
                                    n.id === notification.id ? {...n, isRead: true} : n
                                  );
                                  setNotifications(updatedNotifications);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setNotifications(notifications.filter(n => n.id !== notification.id));
                                  toast({
                                    title: "Notification deleted",
                                    description: "The notification has been removed.",
                                    variant: "destructive",
                                  });
                                }}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No unread notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}