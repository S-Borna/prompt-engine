# Email Verification & Trial Limit System

## Overview

PRAXIS now has a complete email verification system with fraud prevention and a 100-prompt trial limit. This prevents multiple account creation and ensures only verified users can access the platform.

---

## 🔐 **How It Works**

### 1. **User Signup**

- User enters email and password on `/signup`
- Account is created via `/api/auth/register`
- System automatically sends a verification email to the user's inbox
- User is redirected to `/verify-pending` page

### 2. **Email Verification**

- User receives a branded HTML email with a **Verify Email** button
- Clicking the button goes to `/api/auth/verify?token=...`
- Server verifies the token (24-hour expiry)
- Email is marked as verified in the system
- User receives a **Welcome Email** with trial details
- User is redirected to `/login` with success message

### 3. **Dashboard Access**

- Middleware checks if user is authenticated
- Middleware checks if email is verified
- Unverified users are redirected to `/verify-pending`
- Verified users can access the dashboard

### 4. **100-Prompt Trial Limit**

- Every AI prompt generation increments the usage counter
- Trial users see their remaining prompts (e.g., "95/100")
- After 100 prompts, they get an upgrade prompt:
  - "You've used all 100 trial prompts. Upgrade to Standard ($9.99/mo) for unlimited access."
- Standard/Premium users get unlimited prompts

---

## 📁 **Files Created/Modified**

### **New Files**

1. **`/src/lib/verification.ts`** (72 lines)
   - Token generation and validation
   - In-memory token store (replace with Redis in production)
   - 24-hour token expiry

2. **`/src/lib/email.ts`** (179 lines)
   - SendGrid integration
   - `sendVerificationEmail()` — Branded HTML email with verify button
   - `sendWelcomeEmail()` — Post-verification welcome message

3. **`/src/lib/usage-tracker.ts`** (52 lines)
   - In-memory prompt usage counter (replace with database/Redis in production)
   - `getPromptUsage(email)` — Get current usage
   - `incrementPromptUsage(email)` — Increment counter
   - `hasExceededTrialLimit(email, limit)` — Check if limit reached

4. **`/src/app/api/auth/verify/route.ts`** (32 lines)
   - Handles `/api/auth/verify?token=...` clicks
   - Verifies token and marks email as verified
   - Sends welcome email
   - Redirects to login with success message

5. **`/src/app/verify-pending/page.tsx`** (78 lines)
   - "Check your email" page shown to unverified users
   - Branded design matching landing page
   - Instructions and help text

6. **`/test-email.js`** (36 lines)
   - Test script to verify SendGrid integration
   - Sends test verification and welcome emails

### **Modified Files**

1. **`/src/lib/auth.ts`**
   - Added `emailVerified` boolean to session
   - Added `promptsUsed` counter to session (deprecated — using usage-tracker instead)
   - Added `markEmailVerified()` function
   - Added `isEmailVerified()` function
   - Sends verification email on new signups
   - Executives and demo users are auto-verified

2. **`/src/app/api/ai/enhance/route.ts`**
   - Added authentication check at start
   - Added email verification check
   - Added 100-prompt trial limit check
   - Increments usage counter after successful generation
   - Returns usage stats in response (`promptsUsed`, `promptsRemaining`)

3. **`/src/middleware.ts`**
   - Added authentication checks for `/dashboard` and `/api/ai` routes
   - Redirects unauthenticated users to `/login`
   - Redirects unverified users to `/verify-pending`

4. **`/src/app/login/page.tsx`**
   - Added success alert for verified emails
   - Shows error messages for verification failures
   - Displays URL parameter messages

5. **`/src/app/signup/page.tsx`**
   - Redirects to `/verify-pending` after signup (instead of auto-login)

6. **`.env.local`**
   - Added `SENDGRID_API_KEY` (stored securely, not committed)

---

## 🧪 **Testing the Flow**

### **1. Test Email Integration**

```bash
node test-email.js
```

Check your inbox for verification and welcome emails.

### **2. Test Full Signup Flow**

1. Go to `/signup`
2. Enter a real email (use a throwaway or your own)
3. Check inbox for verification email
4. Click "Verify Email" button
5. Check inbox for welcome email
6. Log in at `/login`
7. Access dashboard

### **3. Test 100-Prompt Limit**

1. Sign up with a new account
2. Use the Spark or Precision pages to generate prompts
3. After 100 prompts, you should see the upgrade message

---

## 🔄 **User Journey**

```
┌─────────────────┐
│   User Signup   │
│  (/signup)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verification    │◄── Branded HTML email sent
│ Email Sent      │    (24-hour expiry)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Clicks     │
│ Verify Button   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Verified  │◄── Welcome email sent
│ (/api/verify)   │    (trial details)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   User Login    │
│   (/login)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard       │◄── 100 prompts available
│ (/dashboard)    │    Counter increments per use
└─────────────────┘
         │
         ▼ (after 100 prompts)
┌─────────────────┐
│ Upgrade Prompt  │
│ ($9.99/mo)      │
└─────────────────┘
```

---

## 🚨 **Fraud Prevention**

### **Current Measures**

1. ✅ **Email verification** — Requires 1 real email per account
2. ✅ **Rate limiting** — 5 AI calls per minute (IP-based)
3. ✅ **100-prompt trial limit** — Prevents abuse of free tier
4. ✅ **Executive bypass** — `said@saidborna.com` gets unlimited access

### **Future Hardening (Optional)**

- **Device fingerprinting** — Track browser/device signatures
- **Disposable email blocking** — Block temp-mail domains
- **IP cooldowns** — Limit signups per IP per hour
- **Stripe payment gate** — Require payment after trial for Standard/Premium

---

## 💰 **Pricing Enforcement**

### **Trial (Free for 7 days)**

- ✅ 100 prompts total (enforced in `/api/ai/enhance`)
- ✅ All features unlocked
- ✅ No credit card required
- ❌ After 100 prompts → upgrade prompt shown

### **Standard ($9.99/mo)**

- ✅ Unlimited prompts (no counter)
- ✅ $6 profit margin (implies $3.99 API costs)
- ⏳ Payment integration needed (Stripe)

### **Premium ($14.99/mo)**

- ✅ Unlimited prompts (no counter)
- ✅ $8 profit margin (implies $6.99 API costs)
- ⏳ Payment integration needed (Stripe)

---

## 🔧 **Environment Variables**

Add to `.env.local`:

```env
SENDGRID_API_KEY=your-sendgrid-api-key-here
```

---

## 🎨 **Email Design**

Both verification and welcome emails use:

- ✨ PRAXIS branding (gradient logo box)
- 🌑 Dark mode design (#09090b background)
- 🔵 Gradient buttons (violet → indigo)
- 📱 Responsive HTML tables
- 🔗 Clear call-to-action buttons

---

## ⚠️ **Production Considerations**

### **Replace In-Memory Stores**

Current implementation uses in-memory storage for:

1. Verification tokens (`/src/lib/verification.ts`)
2. Verified emails (`/src/lib/auth.ts`)
3. Prompt usage counters (`/src/lib/usage-tracker.ts`)

**Production solution:**

- Use **Redis** for fast, persistent storage
- OR use **Prisma database** with indexed queries
- OR use **Upstash Redis** (serverless-friendly)

### **Token Security**

- Current: Random 32-char string
- Production: Use JWT with `NEXTAUTH_SECRET` signing
- OR use crypto.randomBytes(32).toString('hex')

### **Email Domain Validation**

Add to `/src/lib/verification.ts`:

```ts
const DISPOSABLE_DOMAINS = ['tempmail.com', 'guerrillamail.com', ...];
```

---

## ✅ **What's Complete**

- [x] SendGrid SDK installed
- [x] Email templates created (verification + welcome)
- [x] Verification token system
- [x] Verification API route
- [x] Auth system integration
- [x] 100-prompt usage tracking
- [x] Limit enforcement in AI routes
- [x] Verification pending page
- [x] Login/signup flow updates
- [x] Middleware auth checks

---

## 🚀 **Next Steps**

1. **Test the full flow** (signup → verify → login → use 100 prompts)
2. **Add Stripe integration** for Standard/Premium subscriptions
3. **Replace in-memory stores** with Redis/database
4. **Add disposable email blocking** (optional)
5. **Monitor usage analytics** (track conversion rates)

---

## 📞 **Support**

Questions? Contact Said Borna at `said@saidborna.com`

**Status:** ✅ Email verification system is fully implemented and ready for testing!
