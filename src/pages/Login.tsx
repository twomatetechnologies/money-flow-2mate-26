
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isDevelopmentMode, toggleDevelopmentMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result.requires2FA) {
        // Redirect to 2FA page
        navigate('/two-factor-auth', { 
          state: { requires2FA: true, email }
        });
        return;
      }
      
      // Normal login, redirect to home
      navigate('/');
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Money Flow Guardian
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDevelopmentMode}
              title={isDevelopmentMode ? "Switch to Production Mode" : "Switch to Development Mode"}
              className="h-8 w-8"
            >
              <Bug className={`h-4 w-4 ${isDevelopmentMode ? "text-red-500" : "text-muted-foreground"}`} />
            </Button>
          </div>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col">
            <Button type="submit" className="w-full mb-3" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            {isDevelopmentMode && (
              <div className="px-2 py-2 bg-amber-50 border border-amber-200 rounded-md w-full">
                <p className="text-amber-800 text-sm font-medium mb-1">Development Mode</p>
                <p className="text-amber-700 text-sm">Login with: <code>user@example.com</code> / <code>password</code></p>
                <p className="text-amber-700 text-sm mt-1">For 2FA demo: <code>test@example.com</code> / <code>password</code></p>
              </div>
            )}
          </CardFooter>
        </form>
        {!isDevelopmentMode && (
          <div className="px-8 pb-6 text-center text-sm">
            <p>Need help? Contact your administrator</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
