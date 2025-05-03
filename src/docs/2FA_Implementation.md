
# Two-Factor Authentication (2FA) Implementation

## Current Implementation

The current implementation in the Money Flow Guardian application is a **demonstration/simulation** of 2FA functionality:

1. When a user logs in with the email "test@example.com", the system flags that account as requiring 2FA verification.
2. The user is redirected to the `/two-factor-auth` page.
3. For demonstration purposes, the system accepts **any 6-digit code** entered by the user.
4. There is a simulated "resend code" functionality with a 30-second cooldown timer.

## Real-World Implementation

In a production environment, the 2FA implementation should be enhanced as follows:

### 1. OTP Generation and Delivery

**Email-based OTP:**
- Generate a secure random 6-digit code on the backend
- Store the code with an expiration timestamp (typically 5-10 minutes)
- Send the code via an email service like SendGrid, AWS SES, or Mailgun

**SMS-based OTP:**
- Generate a secure random 6-digit code
- Use an SMS gateway service like Twilio, AWS SNS, or MessageBird to send the code

### 2. OTP Verification

- Compare the user-entered code with the stored code
- Verify that the code hasn't expired
- Implement rate limiting to prevent brute force attacks
- Provide backup recovery methods (backup codes, etc.)

### 3. Integration Steps

1. Set up accounts with email/SMS service providers
2. Create backend API endpoints for:
   - Generating and sending OTP
   - Verifying OTP
   - Managing 2FA settings (enable/disable)
3. Store user 2FA preferences and backup codes securely in the database
4. Add proper error handling and user feedback

### 4. Security Considerations

- Store OTP codes securely, preferably hashed
- Implement rate limiting on verification attempts
- Add device remembering functionality (optional)
- Provide backup recovery options
- Log all 2FA activities for audit purposes

## Implementation with Supabase

If using Supabase (recommended for Lovable apps):

1. Use Supabase Auth for the basic authentication
2. Use Supabase Edge Functions to handle OTP generation and verification
3. Use Supabase database to store user 2FA preferences and logs
4. Use Supabase Storage to store email templates
5. Integrate with external email/SMS providers through Supabase Edge Functions

## Technical Implementation Details

### Code Structure

The 2FA implementation is split across several components:

1. **TwoFactorAuth.tsx** - The main component that handles the 2FA UI and verification
2. **AuthContext.tsx** - Manages the authentication state, including 2FA requirements
3. **authService.ts** - Contains the simulated backend authentication logic

### Verification Flow

1. User submits login credentials
2. Login handler in AuthContext checks if the account requires 2FA
3. If required, user is redirected to the 2FA verification page
4. User enters code and submits
5. Verification function checks the code (currently simulated)
6. Upon success, user is fully authenticated and redirected to the dashboard

### Integration with Audit Trail

All 2FA-related actions are logged in the audit trail, including:
- 2FA enablement/disablement
- Successful and failed verification attempts
- Code resend requests

This provides a comprehensive security log for monitoring suspicious activities.
