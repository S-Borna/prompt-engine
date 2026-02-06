// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SERVICE — SendGrid integration for transactional emails
// Premium branded templates matching PRAXIS design system
// ═══════════════════════════════════════════════════════════════════════════

import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'said@saidborna.com';
const FROM_NAME = 'PRAXIS';
const BASE_URL = process.env.NEXTAUTH_URL || 'https://praxis.saidborna.com';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

// ─── Shared Email Shell ────────────────────────────────────────────────────
function emailShell(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>PRAXIS</title>
    <!--[if mso]>
    <style>table,td{font-family:Arial,sans-serif!important}</style>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050507;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden text for email preview) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    PRAXIS — Prompt Engineering Platform
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050507;padding:32px 16px;">
<tr><td align="center">

<!-- Container -->
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

    <!-- Logo Header -->
    <tr>
        <td style="padding:0 0 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
                <td style="width:36px;height:36px;background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%);border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;line-height:36px;">
                    ✦
                </td>
                <td style="padding-left:12px;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:1.5px;">
                    PRAXIS
                </td>
            </tr>
            </table>
        </td>
    </tr>

    <!-- Main Card -->
    <tr>
        <td style="background-color:#0a0a0f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
            ${content}
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="padding:32px 0 0;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.5;">
                © 2026 PRAXIS by Said Borna · Stockholm, Sweden
            </p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">
                <a href="${BASE_URL}/legal/terms" style="color:rgba(255,255,255,0.2);text-decoration:none;">Terms</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${BASE_URL}/legal/privacy" style="color:rgba(255,255,255,0.2);text-decoration:none;">Privacy</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${BASE_URL}/legal/cookies" style="color:rgba(255,255,255,0.2);text-decoration:none;">Cookies</a>
            </p>
        </td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── CTA Button ────────────────────────────────────────────────────────────
function ctaButton(href: string, label: string): string {
    return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr>
    <td style="border-radius:10px;background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%);text-align:center;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;">
            ${label}
        </a>
    </td>
</tr>
</table>`;
}

// ─── Feature Row (icon + text) ─────────────────────────────────────────────
function featureRow(emoji: string, title: string, description: string): string {
    return `
<tr>
    <td style="padding:12px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="width:40px;vertical-align:top;">
                <div style="width:32px;height:32px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:15px;">
                    ${emoji}
                </div>
            </td>
            <td style="padding-left:12px;vertical-align:top;">
                <p style="margin:0;font-size:14px;font-weight:600;color:rgba(255,255,255,0.85);">${title}</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.4;">${description}</p>
            </td>
        </tr>
        </table>
    </td>
</tr>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION EMAIL
// ═══════════════════════════════════════════════════════════════════════════
export async function sendVerificationEmail(to: string, token: string) {
    if (!SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
    }

    const verifyUrl = `${BASE_URL}/api/auth/verify?token=${token}`;

    const content = `
<!-- Hero -->
<td style="padding:40px 36px 0;">
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
        Verify your email
    </h1>
    <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);line-height:1.5;">
        You're one click away from structured, platform-optimized prompts.
    </p>
</td>

<!-- Divider -->
<td style="padding:24px 36px;">
    <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
</td>

<!-- Body -->
<td style="padding:0 36px;">
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;">
        Click the button below to confirm your email address and activate your account. This link expires in 24 hours.
    </p>

    ${ctaButton(verifyUrl, 'Verify Email Address →')}
</td>

<!-- Fallback Link -->
<td style="padding:28px 36px 0;">
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:16px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.5px;">
            Or copy this link
        </p>
        <p style="margin:0;font-size:12px;color:#8b5cf6;word-break:break-all;line-height:1.5;">
            ${verifyUrl}
        </p>
    </div>
</td>

<!-- Security Note -->
<td style="padding:24px 36px 36px;">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.5;">
        If you didn't create a PRAXIS account, you can safely ignore this email. This link will expire automatically.
    </p>
</td>`;

    const msg = {
        to,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Verify your PRAXIS account',
        text: `Welcome to PRAXIS! Verify your email by clicking this link: ${verifyUrl} — This link expires in 24 hours.`,
        html: emailShell(content),
    };

    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error('SendGrid error:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME EMAIL (sent after verification)
// ═══════════════════════════════════════════════════════════════════════════
export async function sendWelcomeEmail(to: string, name: string) {
    if (!SENDGRID_API_KEY) return false;

    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    const content = `
<!-- Hero -->
<td style="padding:40px 36px 0;">
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
        You're in, ${displayName}.
    </h1>
    <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);line-height:1.5;">
        Your account is verified and your trial is active.
    </p>
</td>

<!-- Divider -->
<td style="padding:24px 36px;">
    <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
</td>

<!-- Trial Info Box -->
<td style="padding:0 36px;">
    <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08) 0%,rgba(99,102,241,0.06) 100%);border:1px solid rgba(139,92,246,0.12);border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:rgba(139,92,246,0.8);text-transform:uppercase;letter-spacing:0.5px;">
            Your trial includes
        </p>
        <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
            100 prompts
        </p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
            7-day trial · No credit card required
        </p>
    </div>
</td>

<!-- Features -->
<td style="padding:24px 36px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${featureRow('⚡', 'Two Enhancement Modes', 'Quick polish or guided step-by-step refinement')}
        ${featureRow('🎯', 'Platform Optimization', 'Outputs tuned for ChatGPT, Claude, Gemini & Grok')}
        ${featureRow('📊', 'Quality Scoring', 'See exactly how your prompt improved')}
    </table>
</td>

<!-- CTA -->
<td style="padding:28px 36px 0;">
    ${ctaButton(`${BASE_URL}/dashboard`, 'Open Dashboard →')}
</td>

<!-- Data Note -->
<td style="padding:24px 36px 36px;">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.5;">
        By using PRAXIS, you agree to our <a href="${BASE_URL}/legal/terms" style="color:rgba(139,92,246,0.6);text-decoration:none;">Terms of Service</a> and <a href="${BASE_URL}/legal/privacy" style="color:rgba(139,92,246,0.6);text-decoration:none;">Privacy Policy</a>. Your prompts and usage data are stored to provide the service and improve the platform.
    </p>
</td>`;

    const msg = {
        to,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Welcome to PRAXIS, ${displayName} — Your trial is active`,
        text: `Welcome to PRAXIS, ${displayName}! Your account is verified. You have 100 prompts in your 7-day trial. Get started: ${BASE_URL}/dashboard`,
        html: emailShell(content),
    };

    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error('SendGrid error:', error);
        return false;
    }
}
