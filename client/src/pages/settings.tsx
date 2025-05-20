import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserPlus, Pencil, Trash2, Shield, ShieldAlert, UserCog, User, Users } from "lucide-react";

// User form schema
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordChangeRequired: z.boolean().default(true),
  role: z.enum(["user", "admin"], {
    required_error: "Role is required",
  })
});

type UserFormValues = z.infer<typeof userFormSchema>;

// User model
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader className="bg-amber-50 border-b">
          <CardTitle className="text-amber-800">Access Restricted</CardTitle>
          <CardDescription className="text-amber-700">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-gray-700">
            The Settings page is only accessible to administrators. Please contact an administrator if you need access.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/users', {
        method: 'GET'
      });
      return response.json();
    }
  });

  // Create User Form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "user",
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (values: UserFormValues) => {
      return apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsUserDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: Partial<UserFormValues> }) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsUserDialogOpen(false);
      form.reset();
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  function onSubmit(values: UserFormValues) {
    if (editingUser) {
      // If updating, remove password if it's empty (meaning no change)
      const updateValues = { ...values };
      if (updateValues.password === "") {
        delete updateValues.password;
      }
      updateUser.mutate({ id: editingUser.id, values: updateValues });
    } else {
      createUser.mutate(values);
    }
  }

  // Handle edit user
  function handleEditUser(user: User) {
    setEditingUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: "", // Don't populate password field when editing
      role: user.role as "user" | "admin",
    });
    setIsUserDialogOpen(true);
  }

  // Handle delete user
  function handleDeleteUser(user: User) {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  }

  // Handle dialog close
  function handleDialogClose() {
    setIsUserDialogOpen(false);
    setEditingUser(null);
    form.reset();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and system settings
          </p>
        </div>
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => {
              setEditingUser(null);
              form.reset({
                username: "",
                email: "",
                firstName: "",
                lastName: "",
                password: "",
                role: "user",
              });
            }}>
              <UserPlus size={16} />
              <span>Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? "Update user information and permissions." 
                  : "Create a new user account with specific access permissions."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{editingUser ? "New Password (leave empty to keep current)" : "Password"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={editingUser ? "••••••••" : "Enter password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!editingUser && (
                  <FormField
                    control={form.control}
                    name="passwordChangeRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Require password change</FormLabel>
                          <FormDescription>
                            User will be prompted to change password on first login.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>User</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield size={14} />
                              <span>Administrator</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === "admin" 
                          ? "Administrators have full access to all features including user management." 
                          : "Users have limited access to application features."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUser.isPending || updateUser.isPending}
                  >
                    {createUser.isPending || updateUser.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="px-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>User Management</CardTitle>
          </div>
          <CardDescription>
            Manage existing user accounts and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found. Add your first user with the button above.</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge variant="default" className="bg-primary text-white flex w-fit items-center gap-1">
                            <Shield size={12} />
                            <span>Admin</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex w-fit items-center gap-1">
                            <User size={12} />
                            <span>User</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.id === user?.id} // Prevent self-deletion
                          >
                            <Trash2 size={14} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => userToDelete && deleteUser.mutate(userToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}