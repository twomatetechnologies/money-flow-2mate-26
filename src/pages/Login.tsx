import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeOffIcon, AlertCircle } from 'lucide-react';
import { DatabaseConnectionDialog } from '@/components/auth/DatabaseConnectionDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  // Get intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    // Client-side validation
    let hasErrors = false;
    const newFormErrors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      newFormErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newFormErrors.email = "Please enter a valid email";
      hasErrors = true;
    }
    
    if (!password) {
      newFormErrors.password = "Password is required";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFormErrors(newFormErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Attempt login
      const result = await login(email, password);

      if (!result.success) {
        // Display specific error message from the API as a toast notification
        toast({
          title: "Login Failed",
          description: result.errorMessage || "Invalid email or password. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (result.requires2FA) {
        // If 2FA is required, navigate to the 2FA page with the right state
        navigate('/two-factor-auth', {
          state: { requires2FA: true, email, from }
        });
      } else {
        // Otherwise navigate to the intended destination
        navigate(from);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center relative">
          <h1 className="text-3xl font-bold tracking-tight">Money Flow Guardian</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Sign in to access your financial dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="example@email.com"
                  className={formErrors.email ? "border-red-500" : ""}
                  autoFocus
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Clear error when user starts typing
                      if (formErrors.password) {
                        setFormErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="••••••••"
                    className={formErrors.password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Remember me
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="flex justify-between w-full">
                <DatabaseConnectionDialog />
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
