// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SERVICE — SendGrid integration for transactional emails
// ═══════════════════════════════════════════════════════════════════════════

import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'said@saidborna.com';
const FROM_NAME = 'PRAXIS';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendVerificationEmail(to: string, token: string) {
    if (!SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
    }

    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    const msg = {
        to,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Verify your PRAXIS account',
        text: `Welcome to PRAXIS! Click this link to verify your email: ${verifyUrl}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0c0c0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 12px; margin: 0 auto 16px; display: inline-flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 24px;">✨</span>
                            </div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Welcome to PRAXIS</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px; color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                            <p style="margin: 0 0 24px;">Thanks for signing up! You're one step away from transforming your prompts into structured, platform-optimized instructions.</p>
                            
                            <p style="margin: 0 0 32px; color: rgba(255,255,255,0.5); font-size: 15px;">Click the button below to verify your email address and activate your account:</p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 16px rgba(139, 92, 246, 0.15);">
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <p style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); font-size: 14px;">
                                Or copy this link into your browser:<br>
                                <a href="${verifyUrl}" style="color: #8b5cf6; text-decoration: none; word-break: break-all;">${verifyUrl}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; border-top: 1px solid rgba(255,255,255,0.06); background-color: rgba(255,255,255,0.01);">
                            <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 13px; line-height: 1.5;">
                                This link will expire in 24 hours. If you didn't create a PRAXIS account, you can safely ignore this email.
                            </p>
                            <p style="margin: 16px 0 0; color: rgba(255,255,255,0.25); font-size: 12px;">
                                © 2026 PRAXIS · <a href="https://praxis.saidborna.com" style="color: rgba(255,255,255,0.3); text-decoration: none;">praxis.saidborna.com</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error('SendGrid error:', error);
        return false;
    }
}

export async function sendWelcomeEmail(to: string, name: string) {
    if (!SENDGRID_API_KEY) return false;

    const msg = {
        to,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Welcome to PRAXIS — Your account is ready',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0c0c0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="padding: 40px; color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6;">
                            <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #ffffff;">You're all set, ${name}! 🎉</h2>
                            
                            <p style="margin: 0 0 24px;">Your PRAXIS account is now active. Here's what you get with your <strong style="color: rgba(255,255,255,0.9);">7-day trial</strong>:</p>
                            
                            <ul style="margin: 0 0 32px; padding-left: 20px; color: rgba(255,255,255,0.6);">
                                <li style="margin-bottom: 12px;"><strong style="color: rgba(255,255,255,0.8);">100 prompts</strong> to try both enhancement modes</li>
                                <li style="margin-bottom: 12px;"><strong style="color: rgba(255,255,255,0.8);">Platform optimization</strong> for ChatGPT, Claude, Gemini, and Grok</li>
                                <li style="margin-bottom: 12px;"><strong style="color: rgba(255,255,255,0.8);">Full access</strong> to structured output and quality scoring</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                    Start Building with PRAXIS
                                </a>
                            </div>
                            
                            <p style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); font-size: 14px;">
                                Need help? Reply to this email or visit our <a href="${process.env.NEXTAUTH_URL}/help" style="color: #8b5cf6; text-decoration: none;">help center</a>.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error('SendGrid error:', error);
        return false;
    }
}
