
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { verify2FA, resend2FACode } = useAuth();
  
  // Redirect if user doesn't have pending 2FA
  useEffect(() => {
    if (!location.state?.requires2FA || !localStorage.getItem('auth_temp_token')) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue.",
        variant: "destructive"
      });
      navigate('/login', { replace: true });
    }
  }, [location, navigate, toast]);

  // Countdown timer for OTP
  useEffect(() => {
    if (secondsLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Validate OTP format first
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        setError("Please enter a valid 6-digit code");
        setIsSubmitting(false);
        return;
      }
      
      // Use the new verify2FA method from context
      const result = await verify2FA(otp);
      
      if (result.success) {
        toast({
          title: "Verification successful",
          description: "You have been successfully authenticated."
        });
        
        // Navigate to dashboard or original intended destination
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      } else {
        // Handle failed verification
        setAttempts(prev => prev + 1);
        setError(result.errorMessage || `Invalid verification code. Please try again. (${3 - attempts} attempts remaining)`);
        
        // After 3 failed attempts, redirect to login
        if (attempts >= 2) {
          toast({
            title: "Too many failed attempts",
            description: "Please login again to receive a new verification code.",
            variant: "destructive"
          });
          
          setTimeout(() => {
            localStorage.removeItem('auth_temp_token');
            navigate('/login', { replace: true });
          }, 2000);
        }
      }
    } catch (error) {
      setError("An error occurred during verification. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    // Clear current error if any
    setError("");
    setIsSubmitting(true);
    
    try {
      // Get the email from location state
      const email = location.state?.email;
      
      if (!email) {
        setError("Email information missing. Please return to login page.");
        setTimeout(() => navigate('/login', { replace: true }), 2000);
        return;
      }
      
      // Call the resend2FACode method
      const result = await resend2FACode(email);
      
      if (result.success) {
        setSecondsLeft(30);
        setOtp("");
        toast({
          title: "New code sent",
          description: "A new verification code has been sent to your email."
        });
      } else {
        setError(result.errorMessage || "Failed to resend verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setError("An error occurred while resending the code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-center py-4">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(value) => {
                  setOtp(value);
                  // Clear error when user starts typing a new code
                  if (error) setError("");
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive a code? 
              {secondsLeft > 0 ? (
                <span className="ml-1">Resend in {secondsLeft}s</span>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResendCode} 
                  className="ml-1 text-primary hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
