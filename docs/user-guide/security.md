
# Security Features

Money Flow Guardian implements several security features to protect your financial data.

## Authentication

The application uses a secure authentication system with the following features:

- Email and password-based login with secure bcrypt hashing
- Two-factor authentication (2FA)
- Session management with token-based authentication
- Access control based on user permissions
- Secure password reset and update mechanisms

For more detailed information about the password management implementation, please refer to the [Password Management Documentation](/docs/password-management.md).

## Two-Factor Authentication (2FA) Implementation

### Current Implementation

The current implementation in the Money Flow Guardian application is a **demonstration/simulation** of 2FA functionality:

1. When a user logs in with the email "test@example.com", the system flags that account as requiring 2FA verification.
2. The user is redirected to the `/two-factor-auth` page.
3. For demonstration purposes, the system accepts **any 6-digit code** entered by the user.
4. There is a simulated "resend code" functionality with a 30-second cooldown timer.

### Real-World Implementation

In a production environment, the 2FA implementation should be enhanced as follows:

#### 1. OTP Generation and Delivery

**Email-based OTP:**
- Generate a secure random 6-digit code on the backend
- Store the code with an expiration timestamp (typically 5-10 minutes)
- Send the code via an email service like SendGrid, AWS SES, or Mailgun

**SMS-based OTP:**
- Generate a secure random 6-digit code
- Use an SMS gateway service like Twilio, AWS SNS, or MessageBird to send the code

#### 2. OTP Verification

- Compare the user-entered code with the stored code
- Verify that the code hasn't expired
- Implement rate limiting to prevent brute force attacks
- Provide backup recovery methods (backup codes, etc.)

#### 3. Integration Steps

1. Set up accounts with email/SMS service providers
2. Create backend API endpoints for:
   - Generating and sending OTP
   - Verifying OTP
   - Managing 2FA settings (enable/disable)
3. Store user 2FA preferences and backup codes securely in the database
4. Add proper error handling and user feedback

#### 4. Security Considerations

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

## Data Protection

### Local Storage Security

Since the application uses localStorage for data persistence in the demonstration version:

1. Sensitive data is not stored in plain text
2. Application has built-in idle timeout functionality
3. Clear data option is available in settings

### In-Transit Protection

In a production environment:

1. All communication would use HTTPS
2. API requests would use secure tokens
3. Data would be validated both client and server-side

## Audit Trails

The application maintains comprehensive audit trails for all important actions:

- Investment creation, modification, and deletion
- Account settings changes
- Authentication events
- Import/export operations

These audit trails are accessible in the Audit Trail section of the application, providing accountability and the ability to review changes.

## Best Practices for Users

1. Use strong, unique passwords
2. Enable two-factor authentication
3. Review audit logs periodically
4. Log out when accessing from shared devices
5. Keep the application updated to the latest version
