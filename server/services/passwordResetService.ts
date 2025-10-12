// ESA Agent #4 (Authentication) - Password Reset Service
import { emailService } from './emailService';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { storage } from '../storage';

export class PasswordResetService {
  // Generate secure reset token
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return { success: true };
      }

      // Generate reset token
      const token = this.generateResetToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to database
      await storage.createPasswordResetToken(email, token, expires);

      // Generate reset URL
      const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

      // Send email with reset link
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
          </div>
          <div style="padding: 40px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              We received a request to reset your password for your Mundo Tango account.
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="color: #6b7280; margin: 0;">
                Click the button below to reset your password. This link will expire in 1 hour.
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 6px; border: 1px solid #fbbf24;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⚠️ If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #e0e7ff; border-radius: 6px;">
              <p style="color: #3730a3; margin: 0; font-size: 13px;">
                <strong>Security Tip:</strong> Never share your password or reset links with anyone.
              </p>
            </div>
          </div>
          <div style="padding: 20px; background: #f3f4f6; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Mundo Tango. All rights reserved.
            </p>
          </div>
        </div>
      `;

      const result = await emailService.sendEmail(
        email,
        'Reset Your Password - Mundo Tango',
        html
      );

      return { success: result.success, error: result.error?.toString() };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send reset email' 
      };
    }
  }

  // Verify reset token and update password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find valid reset token
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Check if token is expired
      if (new Date() > new Date(resetToken.expires)) {
        return { success: false, error: 'Reset token has expired' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await storage.updateUserPassword(resetToken.email, hashedPassword);

      // Mark token as used
      await storage.deletePasswordResetToken(token);

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      };
    }
  }
}

export const passwordResetService = new PasswordResetService();
