
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Save, AlertCircle } from 'lucide-react'; // Added AlertCircle for error display
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

const Profile = () => {
  const { user, updateUser, isLoading } = useAuth(); // updateUser is now available, isLoading for disabling form
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
  });
  const [error, setError] = React.useState<string | null>(null);


  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null); // Clear previous errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (updateUser && user) { // Check if user exists as well for safety
      // Only pass name and email if they have changed
      const changedData: { name?: string; email?: string } = {};
      if (formData.name !== user.name) {
        changedData.name = formData.name;
      }
      if (formData.email !== user.email) {
        changedData.email = formData.email;
      }

      if (Object.keys(changedData).length === 0) {
        setIsEditing(false);
        toast({
          title: "No Changes",
          description: "Your profile information hasn't changed.",
        });
        return;
      }

      try {
        await updateUser(changedData);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } catch (err) {
        console.error("Profile update failed:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during profile update.");
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update profile. Please try again.",
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading && !user) { // Show loading spinner if auth is still loading and user is not yet available
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
     return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>User data not available. Please log in again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Update Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-gray-100 dark:bg-gray-800" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing || isLoading}
                className={!isEditing ? "bg-gray-100 dark:bg-gray-800" : ""}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={user.role}
                disabled // Role is not editable by user
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={handleEdit}
                  variant="outline"
                  disabled={isLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: user.name, email: user.email }); // Reset form
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
