# PRAXIS — Cashflow Roadmap & Exekveringsplan

> **Mål A:** 500 betalande användare → $4,500 MRR → $54K ARR
> **Mål B:** $10M exit via strategiskt förvärv eller $800K+ ARR
> **Startdatum:** Februari 2026
> **Skapare:** Said Borna — <said@saidborna.com>

---

## 📊 Nuläge (Februari 2026)

| Dimension | Status |
|-----------|--------|
| Produkt | MVP live — Spark + Precision fungerar |
| Auth | NextAuth + email-verifiering via SendGrid |
| Databas | Railway Postgres (15 connection points) |
| Hosting | Cloudflare Workers |
| Användare | < 10 (ingen aktiv marknadsföring) |
| Revenue | $0 |
| Tier-system | FREE / CREATOR / PRO / TEAM / ENTERPRISE (i schema) |
| Trial | 100 prompts, sedan låst |

---

## 🎯 Prissättning

| Tier | Pris | Inkluderar |
|------|------|------------|
| **Free** | $0 | 5 prompts/dag, basic enhancement |
| **Pro** | $9/mån ($7/mån årsvis) | Obegränsade prompts, Chrome Extension, Templates, Historik, Priority AI |
| **Team** | $29/seat/mån | Allt i Pro + Workspace, Shared prompts, Admin panel, Analytics |
| **Enterprise** | Custom ($3K-5K/mån) | SSO, SLA, Dedicated support, API access, Custom models |

### Revenue-milstolpar

| Milstolpe | Krav | Tidsram |
|-----------|------|---------|
| $1K MRR | ~111 Pro-användare | Månad 3-4 |
| $4.5K MRR | 500 Pro-användare | Månad 6-12 |
| $10K MRR | 1,100 Pro ELLER 10 Team-konton | Månad 12-18 |
| $50K MRR | Enterprise-kontrakt + Pro-bas | Månad 18-30 |
| $67K MRR ($800K ARR) | Exit-ready | Månad 24-36 |

---

## 🚀 TIER 1 — Aktivering + Betalning (Månad 1)

### 1.1 💳 Stripe + Pro-betalvägg

**Prio:** 🔴 KRITISK — Ingen revenue utan detta
**Tid:** 3-5 dagar
**Utförare:** Copilot (kod) + Said (Stripe Dashboard setup)

#### Saids uppgifter

- [ ] Skapa Stripe-konto på [stripe.com](https://stripe.com)
- [ ] Skapa produkt "PRAXIS Pro" i Stripe Dashboard
- [ ] Skapa prisobjekt: $9/mån och $7/mån (yearly = $84/år)
- [ ] Hämta API-nycklar (Publishable + Secret)
- [ ] Lägg till env vars i Cloudflare Workers:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRO_PRICE_ID`
  - `STRIPE_PRO_YEARLY_PRICE_ID`
- [ ] Konfigurera webhook endpoint i Stripe: `https://praxis.saidborna.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

#### Copilot bygger

- [ ] `POST /api/stripe/checkout` — Skapar Checkout Session
- [ ] `POST /api/stripe/webhook` — Hanterar Stripe-events
- [ ] `POST /api/stripe/portal` — Customer Portal (hantera prenumeration)
- [ ] Prisma: `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId` på User
- [ ] Upgrade-knapp i sidebar + billing-sida
- [ ] Tier-gating: Free = 5/dag, Pro = obegränsat
- [ ] Billing-sida med aktuell plan, fakturor, cancel/upgrade

#### Definition of Done

- [ ] Användare kan klicka "Upgrade to Pro" → Stripe Checkout → betala → tier uppdateras till PRO i Postgres
- [ ] Webhook bekräftar betalning och uppdaterar tier automatiskt
- [ ] Cancel → tier återgår till FREE vid periodens slut
- [ ] Billing-sidan visar aktuell plan och nästa fakturadatum

---

### 1.2 🧩 Chrome Extension (MVP)

**Prio:** 🔴 KRITISK — Primär distributionskanal
**Tid:** 2-3 veckor
**Utförare:** Copilot (kod) + Said (publicering)

#### Saids uppgifter

- [ ] Registrera Chrome Web Store Developer-konto ($5 engångsavgift)
- [ ] Skapa ikoner (128x128, 48x48, 16x16) — kan använda PRAXIS-loggan
- [ ] Skriv Store-listing (titel, beskrivning, screenshots)
- [ ] Publicera extension efter godkänd review (~2-5 dagar)
- [ ] Marknadsför: "Installera PRAXIS direkt i ChatGPT"

#### Copilot bygger

- [ ] Separat `/chrome-extension` mapp i repot
- [ ] `manifest.json` (Manifest V3)
- [ ] Content script som injicerar PRAXIS-knapp i:
  - ChatGPT (chat.openai.com)
  - Claude (claude.ai)
  - Gemini (gemini.google.com)
- [ ] Popup UI — snabb prompt-enhancement
- [ ] API-anrop till `praxis.saidborna.com/api/ai/enhance`
- [ ] Auth: Skicka JWT/API-key med requests
- [ ] "Enhance" knapp bredvid textfält → förbättrar prompten inline
- [ ] Free/Pro-gating (Free = 5/dag via extension också)

#### Definition of Done

- [ ] Användaren installerar extension → ser PRAXIS-ikon i ChatGPT
- [ ] Klickar → prompten förbättras → pastar tillbaka i ChatGPT-fältet
- [ ] Fungerar på ChatGPT, Claude, Gemini
- [ ] Pro-användare får obegränsat, Free-användare ser upgrade-prompt

---

### 1.3 📚 Prompt Templates Library

**Prio:** 🟡 HÖG — Ger värde dag 1
**Tid:** 1 vecka
**Utförare:** Copilot (kod + system) + Said (innehåll/curation)

#### Saids uppgifter

- [ ] Samla/skapa 50 bästa prompts i kategorier:
  - Marknadsföring (10): Copywriting, SEO, sociala medier, email
  - Utveckling (10): Code review, debugging, arkitektur, docs
  - Utbildning (10): Förklaringar, studieguider, quiz
  - Business (10): Affärsplaner, pitch, strategi, analys
  - Kreativt (10): Storytelling, brainstorming, design briefs
- [ ] Granska och kvalitetssäkra templates

#### Copilot bygger

- [ ] Prisma: `PromptTemplate` modell (title, content, category, isPro, usageCount)
- [ ] `GET /api/templates` — Lista/sök/filtrera
- [ ] Templates-sida i dashboard (`/dashboard/library` — redan har URL)
- [ ] Kategorier med ikoner
- [ ] "Use Template" → förpopulerar Spark/Precision
- [ ] Gating: 10 templates gratis, resten Pro-only
- [ ] Populäraste templates visas överst (usage tracking)
- [ ] Seed script för att ladda in 50 templates

#### Definition of Done

- [ ] Library-sidan visar 50 templates i 5 kategorier
- [ ] Användare kan söka, filtrera, använda templates
- [ ] Free-användare ser 10 templates, Pro ser alla
- [ ] "Use Template" öppnar Spark med templatens prompt

---

### 1.4 🎯 Onboarding Wow-Flow

**Prio:** 🟡 HÖG — Konverterar gratis till betalande
**Tid:** 3 dagar
**Utförare:** Copilot (kod + UX)

#### Copilot bygger

- [ ] Onboarding-modal vid första inloggning (3 steg):
  1. **"Skriv en prompt som du normalt skulle"** — textfält
  2. **"Se skillnaden"** — Kör enhance, visa före/efter side-by-side med animation
  3. **"Välj din nisch"** — Marketör/Developer/Student/Business/Kreativ
- [ ] Confetti/celebration-effekt vid steg 2 (wow-moment)
- [ ] "Dina prompts är nu X% bättre" — mätbar skillnad
- [ ] CTA: "Vill du ha obegränsade förbättringar? → Pro"
- [ ] Spara `hasCompletedOnboarding` i User-modellen
- [ ] Nisch-val styr vilka templates som rekommenderas

#### Definition of Done

- [ ] Nya användare ser onboarding vid första login
- [ ] Steg 2 visar en WOW-skillnad mellan original och enhanced prompt
- [ ] Onboarding avslutas med Pro-upsell
- [ ] Återkommer inte efter completion

---

## 📈 TIER 2 — Retention + Stickiness (Månad 2-3)

### 2.1 🏆 Prompt Score & Gamification

**Prio:** 🟡 HÖG
**Tid:** 1 vecka
**Utförare:** Copilot

#### Copilot bygger

- [ ] Scoring-algoritm (1-100) baserad på:
  - Längd & specificitet
  - Har expertroll? (+15)
  - Har kontext? (+15)
  - Har outputformat? (+15)
  - Har constraints? (+10)
  - Har approach? (+10)
  - Klarhet & struktur (+20)
  - Actionability (+15)
- [ ] Visa score FÖRE och EFTER enhancement
  - "Din prompt: 23/100 → Efter PRAXIS: 87/100"
- [ ] Progressions-dashboard:
  - Genomsnittlig score över tid (graf)
  - "Din promptskill har ökat 340% sedan du började"
  - Badges: "First Enhancement", "Score 90+", "100 Prompts", "7-Day Streak"
- [ ] Leaderboard (opt-in, anonymiserat)
- [ ] XP-system kopplat till befintliga `xp`, `level`, `streak` i User-modellen

#### Definition of Done

- [ ] Varje prompt får en synlig score före/efter
- [ ] Dashboard visar progression över tid
- [ ] Minst 5 badges implementerade
- [ ] Streak-counter fungerar (redan finns i schema)

---

### 2.2 👥 Team/Workspace

**Prio:** 🟠 MEDEL (men nödvändig för enterprise)
**Tid:** 2 veckor
**Utförare:** Copilot (kod) + Said (sälj/outreach)

#### Copilot bygger

- [ ] Prisma: `Team`, `TeamMember`, `TeamPrompt` modeller
- [ ] Team-creation flow + invite via email
- [ ] Roller: Owner, Admin, Member
- [ ] Shared prompt library (team-nivå)
- [ ] Team-analytics: "Ert team har förbättrat 347 prompts denna månad"
- [ ] Admin-panel: Hantera members, se usage, set limits
- [ ] Billing: Team-plan ($29/seat/mån) via Stripe

#### Saids uppgifter

- [ ] Identifiera 10 potentiella team-kunder (byrå, startup, utbildning)
- [ ] Outreach: "Testa PRAXIS gratis med ditt team i 14 dagar"
- [ ] Samla feedback → iterera

#### Definition of Done

- [ ] Skapa team → bjud in kollegor via email
- [ ] Delade prompts synliga för hela teamet
- [ ] Admin kan se usage per member
- [ ] Team-billing fungerar via Stripe

---

### 2.3 🔌 API Access

**Prio:** 🟠 MEDEL
**Tid:** 1 vecka
**Utförare:** Copilot

#### Copilot bygger

- [ ] API key management (generate, revoke, rotate)
- [ ] `POST /api/v1/enhance` — Public API endpoint
  - Input: `{ prompt, platform?, language? }`
  - Output: `{ enhanced, score, sections, usage }`
- [ ] Rate limiting per API key (100/dag free, 10K/dag Pro, unlimited Enterprise)
- [ ] API usage dashboard
- [ ] Auto-generated API docs (OpenAPI/Swagger)
- [ ] API keys sida i dashboard settings
- [ ] Prisma: `ApiKey` modell (key, userId, name, lastUsed, requestCount)

#### Saids uppgifter

- [ ] Skapa developer docs / landing page
- [ ] Publicera på RapidAPI som extra kanal
- [ ] Outreach till AI-verktyg som vill integrera prompt-enhancement

#### Definition of Done

- [ ] Användare kan skapa API key i dashboard
- [ ] `curl -H "Authorization: Bearer pk_xxx" -d '{"prompt":"..."}' praxis.saidborna.com/api/v1/enhance` fungerar
- [ ] Rate limiting per tier
- [ ] Usage-stats synliga i dashboard

---

### 2.4 🎯 Nischade Verticaler

**Prio:** 🟠 MEDEL (ongoing)
**Tid:** Löpande
**Utförare:** Said (strategi + innehåll) + Copilot (implementation)

#### Saids uppgifter

- [ ] Välj PRIMÄR nisch (rekommendation: **Marknadsförare**)
  - Alternativ: Lärare, Jurister, HR, Småföretagare
- [ ] Skapa nisch-specifika templates (20+ per vertikal)
- [ ] Skriv nisch-specifik copy på landingssidan
- [ ] Skapa case studies: "Hur [företag] sparade 20h/mån med PRAXIS"

#### Copilot bygger

- [ ] Nisch-val vid onboarding (styr rekommendationer)
- [ ] Nisch-specifika system prompts (marknadsföring → copy-fokuserad enhancement)
- [ ] Custom landing pages: `/for/marketers`, `/for/developers`, `/for/educators`
- [ ] Nisch-filtrering i template library

---

## 🏰 TIER 3 — Moat + Exit-Readiness (Månad 4+)

### 3.1 📊 Analytics Dashboard

**Prio:** 🟢 PLANERAD
**Tid:** 1 vecka
**Utförare:** Copilot

#### Copilot bygger

- [ ] Personlig analytics:
  - Totalt antal förbättrade prompts
  - Genomsnittlig score-förbättring
  - Uppskattad tidsbesparing (baserat på branschdata: ~15 min/prompt)
  - "Du har sparat uppskattningsvis 47 timmar denna månad"
  - Most-used platforms (ChatGPT vs Claude vs Gemini)
  - Prompt-kategorier breakdown
- [ ] Grafer: Line chart (prompts/dag), Bar chart (score-distribution)
- [ ] Exportera till PDF (Pro-feature)
- [ ] Weekly email digest: "Din vecka med PRAXIS"

---

### 3.2 🔄 Prompt Versioning

**Prio:** 🟢 PLANERAD
**Tid:** 1 vecka
**Utförare:** Copilot

#### Copilot bygger

- [ ] Prisma: `PromptVersion` modell (promptId, version, content, score, createdAt)
- [ ] Versionshistorik per prompt (v1, v2, v3...)
- [ ] Diff-view: Visa vad som ändrades mellan versioner
- [ ] Rollback: "Återställ till version 2"
- [ ] "Enhance again" → skapar ny version
- [ ] Branch: "Prova en annan approach" → parallella versioner

---

### 3.3 🔐 Enterprise SSO + Admin

**Prio:** 🔵 FRAMTIDA (när enterprise-kunder knackar)
**Tid:** 2 veckor
**Utförare:** Copilot + Said (Auth0/Okta setup)

#### Saids uppgifter

- [ ] Skapa Auth0 eller Okta-konto
- [ ] Konfigurera SAML/OIDC connections
- [ ] Enterprise sales pipeline

#### Copilot bygger

- [ ] SAML SSO integration via NextAuth
- [ ] Enterprise admin panel:
  - User management (invite, deactivate)
  - Usage policies (max prompts/dag, allowed platforms)
  - Audit log
  - Data retention settings
- [ ] SOC 2 readiness checklist
- [ ] SLA monitoring dashboard

---

### 3.4 🧠 Fine-Tunad Modell (MOAT)

**Prio:** 🔵 FRAMTIDA
**Tid:** 2-4 veckor
**Utförare:** Copilot (data pipeline + training) + Said (curation)

#### Saids uppgifter

- [ ] Exportera bästa prompt-par (original → enhanced) från Postgres
- [ ] Curera datasetet: Ta bort PII, filtrera kvalitet
- [ ] Budget: OpenAI fine-tuning kostar ~$25-100 per training run

#### Copilot bygger

- [ ] Data export pipeline: Postgres → JSONL-format
- [ ] Fine-tuning script (OpenAI API)
- [ ] A/B-test: Fine-tuned vs GPT-4o för prompt enhancement
- [ ] Deployment: Switcha till fine-tuned modell om den vinner
- [ ] Continuous training pipeline (ny data → bättre modell)

---

## 📢 Marknadsföring & Distribution (Saids ansvar)

### Kanal 1: Chrome Web Store (Månad 1+)

- [ ] Publicera extension med screenshots + video
- [ ] ASO: Optimera titel/beskrivning för "AI prompt", "ChatGPT helper"
- [ ] Svara på reviews, iterera baserat på feedback
- [ ] Mål: 1,000 installationer första månaden

### Kanal 2: Product Hunt Launch (Månad 2)

- [ ] Skapa PH-profil och bygga community innan launch
- [ ] Förbereda: Video, screenshots, tagline
- [ ] Launch på tisdag/onsdag (bästa dagarna)
- [ ] Aktivera nätverket för upvotes
- [ ] Mål: Top 5 Product of the Day

### Kanal 3: Content Marketing (Löpande)

- [ ] TikTok/Reels: "Dålig prompt vs PRAXIS-prompt" — 30 sek videos
- [ ] YouTube: "How I 10x'd my AI outputs" — tutorial format
- [ ] LinkedIn: "95% of professionals are prompting wrong" — thought leadership
- [ ] Twitter/X: Dagliga prompt-tips + screenshots
- [ ] Blog: SEO-artiklar — "Best ChatGPT prompts for [nisch]"

### Kanal 4: Community (Månad 2+)

- [ ] Discord server för PRAXIS-användare
- [ ] Reddit: r/ChatGPT, r/artificial, r/marketing — dela tips (inte spam)
- [ ] Newsletter: Veckovis "Prompt of the Week" + tips
- [ ] Partnerships: Samarbeta med AI-influencers

### Kanal 5: Referral Program (Månad 3+)

- [ ] "Bjud in en vän → ni båda får 1 månad Pro gratis"
- [ ] Copilot bygger: Referral-system med unika koder + tracking

---

## 💰 Exit-Strategier

### Strategi A: Micro-SaaS Flip ($50K-$200K)

**Krav:** $3K-5K MRR stabil i 3+ månader
**Plattform:** Acquire.com, MicroAcquire
**Multipel:** 24-48x MRR
**Tidsram:** 12-18 månader

### Strategi B: Strategic Acquisition ($1M-$10M)

**Krav:** $50K+ MRR ELLER 50K+ aktiva användare ELLER unik tech (fine-tuned modell)
**Potentiella köpare:**

- Jasper AI (prompt optimization för content)
- Copy.ai (utöka AI writing suite)
- HubSpot (AI för marknadsförare)
- Grammarly (utöka från text → prompt)
- Notion (AI integration)
- Canva (AI content creation)
- Svensk: Sinch, Mentimeter, Kognity

**Tidsram:** 24-36 månader

### Strategi C: VC-Funded Growth → Larger Exit ($10M+)

**Krav:**

1. $10K+ MRR som proof of concept
2. Clear path to $100K MRR
3. Defensible moat (fine-tuned modell, API platform, enterprise contracts)

**Steg:**

1. Pre-seed: $500K-1M (svenska VC: Inventure, Luminar, Antler)
2. Anställ: 1 fullstack dev + 1 growth marketer
3. Seed: $2-5M vid $50K MRR
4. Series A eller exit vid $800K+ ARR

**Tidsram:** 36-48 månader

---

## 📋 Exekverings-Checklista (Vecka för Vecka)

### Vecka 1-2: Stripe + Betalvägg

- [ ] Said: Stripe-konto + API-nycklar + env vars
- [ ] Copilot: Checkout, webhook, portal, tier-gating
- [ ] Test: Full betalningsflöde på produktion
- [ ] Deploy + commit

### Vecka 3-4: Onboarding + Templates

- [ ] Said: Skriva 50 templates (10 per kategori)
- [ ] Copilot: Onboarding-flow + template library
- [ ] Test: Ny användare → onboarding → wow → templates
- [ ] Deploy + commit

### Vecka 5-7: Chrome Extension

- [ ] Said: Chrome Web Store Developer-konto ($5)
- [ ] Copilot: Extension-kod (Manifest V3)
- [ ] Test: Fungerar i ChatGPT, Claude, Gemini
- [ ] Said: Publicera på Chrome Web Store
- [ ] Deploy

### Vecka 8: Prompt Score + Gamification

- [ ] Copilot: Scoring-algoritm + badges + progression
- [ ] Test: Score visas på varje prompt
- [ ] Deploy + commit

### Vecka 9: Product Hunt Launch

- [ ] Said: Förbereda assets (video, screenshots, copy)
- [ ] Said: Launch på PH
- [ ] Copilot: Eventuella hotfixes baserat på trafik

### Vecka 10-12: Team/Workspace + API

- [ ] Copilot: Team-funktionalitet + API keys
- [ ] Said: Börja enterprise outreach
- [ ] Deploy + commit

### Månad 4+: Iteration baserat på data

- [ ] Analysera: Vilka features används? Var droppar folk av?
- [ ] Iterera: Dubbla ner på det som funkar
- [ ] Överväg: Fine-tuning, Enterprise SSO, VC

---

## 🧮 Kostnadsöversikt

| Post | Kostnad | Frekvens |
|------|---------|----------|
| Cloudflare Workers | $0 (free tier räcker länge) | Månadsvis |
| Railway Postgres | $5-20/mån | Månadsvis |
| OpenAI API | $10-100/mån (beroende på usage) | Månadsvis |
| SendGrid | $0 (free tier: 100 email/dag) | Månadsvis |
| Stripe | 2.9% + $0.30 per transaktion | Per transaktion |
| Chrome Web Store | $5 | Engång |
| Domain (saidborna.com) | ~$12/år | Årligen |
| **Total fast kostnad** | **~$20-30/mån** | |
| **Breakeven** | **~3-4 Pro-kunder** | |

---

## 🎯 KPI:er att Tracka

| KPI | Mål (Månad 3) | Mål (Månad 6) | Mål (Månad 12) |
|-----|---------------|---------------|-----------------|
| Registrerade användare | 500 | 2,000 | 10,000 |
| DAU (Daily Active Users) | 50 | 200 | 1,000 |
| Betalande (Pro) | 20 | 100 | 500 |
| MRR | $180 | $900 | $4,500 |
| Churn rate | < 15% | < 10% | < 7% |
| Chrome Extension installs | 200 | 1,000 | 5,000 |
| NPS Score | > 30 | > 40 | > 50 |
| Prompts enhanced/dag | 100 | 500 | 3,000 |

---

## ⚡ Nästa Steg

**OMGÅNG 1 startar NU:** Stripe + Pro-betalvägg.

Said gör:

1. Skapa Stripe-konto
2. Skapa produkt + priser
3. Hämta API-nycklar
4. Lägg in env vars

Copilot bygger sedan hela betalningsflödet.

> *"The best time to start charging was yesterday. The second best time is today."*

---

*Senast uppdaterad: 6 februari 2026*
