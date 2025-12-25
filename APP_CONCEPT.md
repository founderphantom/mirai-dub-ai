# Mirai Dub AI — App Concept & Business Direction

## Executive Summary
Mirai Dub AI is a mobile-first video translation and dubbing platform designed to democratize global content reach for creators and marketers. By leveraging AI-powered lip-sync technology (via Replicate/HeyGen), the app enables users to instantly translate their video content into multiple languages with natural-looking lip synchronization—removing the uncanny valley that plagues most dubbing solutions.

**The core value proposition:** "Create once, reach the world."

In the Creator Economy, audience reach is currency. Language barriers represent the single largest artificial ceiling on a creator's potential audience. A creator with 1M English-speaking followers is leaving 6B+ non-English speakers on the table. Mirai Dub AI removes that ceiling.

## Problem Statement & Market Opportunity

### The Problem
- **Language barriers limit creator growth** — 75% of internet users are non-English speakers, yet most creator content remains monolingual
- **Traditional dubbing is prohibitively expensive** — Professional dubbing costs $75-150+ per minute of video
- **Existing AI dubbing looks fake** — Poor lip-sync creates viewer distrust and disengagement
- **Technical friction kills adoption** — Current solutions require desktop software, technical expertise, or agency involvement
- **Time-to-publish matters** — Creators need to post consistently across markets; waiting days for translations kills momentum

### The Opportunity
| Market Segment                  | Size          | Growth    |
| :------------------------------ | :------------ | :-------- |
| Creator Economy                 | $250B+ (2024) | 22% CAGR  |
| Video Localization Market       | $3.1B (2024)  | 6.2% CAGR |
| AI Video Generation             | $550M (2024)  | 35%+ CAGR |
| Social Media Marketing Software | $72B (2024)   | 18% CAGR  |

**Key Insight:** The intersection of Creator Economy × AI Video × Localization is underserved. Most localization tools target enterprise; most creator tools ignore localization. Mirai Dub AI sits at this intersection.

## Product Vision & Value Proposition

### Vision Statement
Empower every creator to become a global creator—without learning a new language, hiring translators, or losing their authentic voice.

### Core Value Propositions
| Audience             | Pain Point                                | Mirai Dub AI Solution                        |
| :------------------- | :---------------------------------------- | :------------------------------------------- |
| **Content Creators** | Limited to single-language audience       | One-tap expansion to 50+ language markets    |
| **UGC Marketers**    | Expensive multi-market campaigns          | 10x reduction in localization costs          |
| **Course Creators**  | Can't sell internationally                | Instant course localization for global sales |
| **Small Businesses** | Can't afford video marketing localization | Affordable per-video pricing                 |
| **Agencies**         | Slow turnaround on localized content      | Same-day delivery for clients                |

### Unique Selling Proposition (USP)
**"Lip-sync so real, viewers won't know it's AI."**

This is your wedge. The HeyGen model you're using is currently best-in-class for natural lip synchronization. Lead with this differentiator heavily—most competitors produce obviously-fake dubbing that destroys viewer trust.

## Target Audience Deep Dive

### Primary Persona: "The Scaling Creator"
**Demographics**
- **Age:** 22-38
- **Platforms:** YouTube, TikTok, Instagram Reels
- **Follower count:** 50K-2M
- **Content type:** Educational, lifestyle, commentary
- **Revenue:** $50K-500K/year from content

**Psychographics**
- Growth-obsessed; constantly looking for competitive edges
- Time-poor; values tools that save time over tools with features
- Mobile-native; creates, edits, and publishes from phone
- Budget-conscious but willing to pay for ROI

**Jobs to Be Done**
- "Help me reach Spanish-speaking audiences without learning Spanish"
- "Help me test if my content resonates in other markets"
- "Help me repurpose my best-performing content for new audiences"

### Secondary Persona: "The Global Marketer"
**Demographics**
- **Role:** Marketing Manager, Social Media Manager, Growth Lead
- **Company size:** 10-500 employees (SMB/Mid-market)
- **Industry:** SaaS, E-commerce, DTC brands, Education

**Jobs to Be Done**
- "Help me run video ads in LATAM without hiring a localization agency"
- "Help me test international markets before committing to full localization"
- "Help me maintain brand consistency across language markets"

## Product Features & MVP Scope

### MVP Feature Set (v1.0)
| Feature                      | Priority | Description                                     |
| :--------------------------- | :------- | :---------------------------------------------- |
| **Onboarding Flow**          | P0       | 3-4 screen walkthrough with before/after demo   |
| **Anonymous Trial**          | P0       | 1 free video (no account required)              |
| **Video Upload**             | P0       | Support all mobile formats (MOV, MP4, HEVC)     |
| **Language Selection**       | P0       | Choose target language from supported list      |
| **AI Translation + Dubbing** | P0       | Integration with Replicate/HeyGen API           |
| **Video Preview**            | P0       | Thumbnail + 4-second preview of result          |
| **Video Download**           | P0       | Download translated video to device             |
| **Account Creation**         | P0       | Better Auth integration (+2 bonus videos)       |
| **Credit System**            | P0       | Duration-based credit consumption               |
| **Credit Purchase**          | P0       | Polar Payments integration                      |
| **Job Queue System**         | P0       | Cloudflare Queue-based processing               |
| **Job Status Updates**       | P0       | Real-time status (processing, complete, failed) |

### Post-MVP Features (v1.1+)
| Feature                         | Phase | Description                                |
| :------------------------------ | :---- | :----------------------------------------- |
| **Push Notifications**          | v1.1  | Notify when video is ready                 |
| **Video History**               | v1.1  | View all past translations                 |
| **Subscription Plans**          | v1.2  | Monthly/annual plans with included minutes |
| **Social Account Linking**      | v2.0  | Connect TikTok, YouTube, Instagram         |
| **Auto-Post to Socials**        | v2.0  | One-tap publish to connected accounts      |
| **Multi-Language Batch**        | v2.0  | Translate to multiple languages at once    |
| **Language Account Management** | v2.5  | Manage separate accounts per language      |
| **Analytics Dashboard**         | v3.0  | Track performance across languages         |
| **Team/Agency Features**        | v3.0  | Multi-user accounts, client management     |

## Technical Architecture

### High-Level System Design
```
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICE                              │
│                    (React Native / Expo)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                              │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  Static Assets  │  │  Workers (API)  │                       │
│  │  (Pages/R2)     │  │                 │                       │
│  └─────────────────┘  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Cloudflare R2  │  │ Cloudflare Queue│  │ Cloudflare D1   │
│  (Video Storage)│  │ (Job Processing)│  │  (Database)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Replicate API  │
                    │ (HeyGen Model)  │
                    └─────────────────┘
```

### Video Processing Pipeline
1. **User Upload** → Presigned R2 URL → Direct Upload to R2
2. **Queue Message Created** (job_id, video_ref, target_lang)
3. **Worker Picks Up Message**
    - Video Duration Calculation
    - Send to Replicate for Translation
    - Generate Thumbnail + 4s Preview
4. **Upload Results to R2**
5. **Update DB** (job complete)
6. **Notify User** (poll/push)

### Database Schema (Drizzle ORM)
```typescript
// Core Tables

users
├── id (uuid, pk)
├── email (optional - anonymous users may not have)
├── device_fingerprint
├── ip_hash
├── created_at
├── trial_videos_used (default: 0)
├── bonus_videos_available (default: 0)
└── credits_balance (default: 0)

videos
├── id (uuid, pk)
├── user_id (fk)
├── original_url (r2 path)
├── translated_url (r2 path, nullable)
├── thumbnail_url (r2 path, nullable)
├── preview_url (r2 path, nullable)
├── source_language (detected or specified)
├── target_language
├── duration_seconds
├── credits_consumed
├── status (enum: pending, processing, completed, failed)
├── created_at
└── completed_at

transactions
├── id (uuid, pk)
├── user_id (fk)
├── type (enum: purchase, consumption, bonus)
├── credits_amount
├── polar_payment_id (nullable)
├── video_id (nullable, for consumption)
├── created_at
└── metadata (json)

jobs
├── id (uuid, pk)
├── video_id (fk)
├── replicate_job_id
├── status
├── error_message (nullable)
├── started_at
├── completed_at
└── retry_count
```

### Credit Consumption Logic
```
Credits per video = ceil(duration_seconds / 60) * CREDIT_RATE

Where CREDIT_RATE = 10 credits per minute (adjustable)

Examples:
- 30 second video = 10 credits (1 minute minimum)
- 90 second video = 20 credits (rounds up to 2 minutes)
- 5 minute video = 50 credits
```

## Monetization Strategy

### Progressive Trust Model
| Phase       | Trigger              | Offer                    | Goal                           |
| :---------- | :------------------- | :----------------------- | :----------------------------- |
| **Phase 1** | First app open       | 1 free video (anonymous) | Zero-friction trial            |
| **Phase 2** | Creates account      | +2 bonus videos          | Capture email, enable payments |
| **Phase 3** | Uses all free videos | Credit purchase          | Monetization                   |

### Pricing Structure (Credits)
| Package     | Credits | Price  | $/Credit | Use Case                |
| :---------- | :------ | :----- | :------- | :---------------------- |
| **Starter** | 100     | $9.99  | $0.10    | Testing, occasional use |
| **Creator** | 300     | $24.99 | $0.083   | Regular creator         |
| **Pro**     | 750     | $49.99 | $0.067   | Frequent creator        |
| **Agency**  | 2000    | $99.99 | $0.05    | High volume             |

### Future: Subscription Tiers (v1.2+)
| Tier         | Price/mo | Included Minutes | Overage Rate |
| :----------- | :------- | :--------------- | :----------- |
| **Hobby**    | $19/mo   | 30 min           | $0.50/min    |
| **Creator**  | $49/mo   | 90 min           | $0.40/min    |
| **Pro**      | $99/mo   | 250 min          | $0.30/min    |
| **Business** | $249/mo  | 750 min          | $0.20/min    |

### Unit Economics Target
| Metric                  | Target                         |
| :---------------------- | :----------------------------- |
| **Replicate API Cost**  | ~$0.02-0.04/min video          |
| **Cloudflare Costs**    | ~$0.005/job (storage, compute) |
| **Target COGS**         | <30% of revenue                |
| **Target Gross Margin** | >70%                           |

## Competitive Positioning

### Competitive Landscape
```
                    Enterprise Focus
                          │
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │    Papercup     │    Deepdub      │
        │                 │                 │
Desktop─┼─────────────────┼─────────────────┼─Mobile
        │                 │                 │
        │    ElevenLabs   │   MIRAI DUB AI  │ ← You are here
        │    HeyGen       │                 │
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          │
                    Creator Focus
```

### Competitive Advantages
| Competitor        | Their Weakness                   | Mirai Dub AI Advantage                 |
| :---------------- | :------------------------------- | :------------------------------------- |
| **HeyGen Direct** | Web-only, complex UI, expensive  | Mobile-native, simple, creator pricing |
| **ElevenLabs**    | Audio-only (no lip sync)         | Full video with lip sync               |
| **Papercup**      | Enterprise-only, slow, expensive | Self-serve, instant, affordable        |
| **Rask.ai**       | Desktop-focused, learning curve  | Phone-first, zero learning curve       |
| **Kapwing**       | Dubbing is a side feature        | Dubbing is the core product            |

### Positioning Statement
For social media creators and video marketers who want to expand their audience globally, **Mirai Dub AI** is a mobile video translation app that delivers instant AI dubbing with photorealistic lip sync. Unlike desktop tools and enterprise platforms, Mirai Dub AI lets you translate and publish in under 5 minutes, right from your phone.

## Go-to-Market Strategy

### Phase 1: Creator-Led Growth (Months 1-3)
**Strategy:** Seed to 50-100 mid-tier creators, let them demonstrate product value.
**Tactics:**
- **Creator Seeding Program:** Identify 100 creators (50K-500K followers) in growth-oriented niches (finance, education, business). Offer 500 free credits ($50 value) for review.
- **Before/After Content Machine:** Create viral-worthy before/after comparison content.
- **"Your Clone Speaks Spanish" Hook:** Lead with emotional/novelty hook.

### Phase 2: Paid Acquisition (Months 3-6)
**Strategy:** Once product-market fit is validated, scale via paid channels.
**Channels (Priority Order):**
1. TikTok Ads
2. YouTube Ads
3. Meta Ads
4. Google Ads

**Target CAC:** <$15
**Target LTV:** >$75

### Phase 3: B2B & Agency (Months 6-12)
**Strategy:** Expand to agencies and SMB marketing teams.
**Tactics:**
- Agency partner program
- Integration with existing marketing tools
- Case studies
- LinkedIn/Outbound

## Onboarding Flow Design

- **Screen 1: Hook**
    - **Visual:** Split-screen showing same creator speaking English on left, fluent Spanish with perfect lip sync on right.
    - **Copy:** "What if you spoke every language? Mirai Dub AI translates your videos with lip sync so real, viewers can't tell it's AI."
    - **CTA:** "See the magic →"

- **Screen 2: How It Works**
    - **Visual:** 3-step animation (Upload → Select Language → Download).
    - **Copy:** "Create once. Reach the world. 1. Upload any video. 2. Pick your language. 3. Download & post."
    - **CTA:** "Try it free →"

- **Screen 3: Social Proof**
    - **Visual:** Carousel of creator testimonials/stats.
    - **Copy:** "Join 10,000+ creators going global. 'I gained 50K Spanish-speaking followers in 2 weeks' — @CreatorName"
    - **CTA:** "Get started →"

- **Screen 4: Free Trial Offer**
    - **Visual:** Credit/gift icon animation.
    - **Copy:** "Your first video is on us. Try Mirai Dub AI free — no account needed. Sign up for 2 more free videos."
    - **CTA:** "Translate my first video 🎬"

## Success Metrics & KPIs

### North Star Metric
**Videos Translated Per Week (Active Usage)**

### Funnel Metrics
| Stage           | Metric                      | Target (Month 1) | Target (Month 6) |
| :-------------- | :-------------------------- | :--------------- | :--------------- |
| **Awareness**   | App Store impressions       | 50K              | 500K             |
| **Acquisition** | Downloads                   | 2K               | 25K              |
| **Activation**  | First video translated      | 40% of downloads | 50% of downloads |
| **Retention**   | Returned for 2nd video (7d) | 30%              | 40%              |
| **Revenue**     | Converted to paid           | 5% of activated  | 10% of activated |
| **Referral**    | Organic shares/invites      | 0.3 per user     | 0.5 per user     |

### Unit Economics Targets
- **CAC:** <$15
- **LTV:** >$75
- **LTV:CAC Ratio:** >5:1
- **Payback Period:** <30 days
- **Gross Margin:** >70%

## Product Roadmap

### Q1: Foundation (MVP)
- Core app with upload/translate/download flow
- Anonymous trial + account creation
- Credit-based payments (Polar)
- Basic job queue architecture
- App Store launch

### Q2: Retention & Monetization
- Push notifications for job completion
- Video history and re-download
- Subscription tiers
- Referral program
- In-app feedback collection

### Q3: Distribution & Growth
- Social account linking
- One-tap publish to connected accounts
- Multi-language batch translation
- Creator program

### Q4: Scale & B2B
- Team/agency accounts
- Analytics dashboard
- API access
- White-label option
- Enterprise tier

## Risk Assessment & Mitigation
| Risk                                  | Likelihood | Impact   | Mitigation                                                                 |
| :------------------------------------ | :--------- | :------- | :------------------------------------------------------------------------- |
| **Replicate API reliability**         | Medium     | High     | Build retry logic, queue dead-letter handling, consider backup providers   |
| **Replicate price increases**         | Medium     | High     | Negotiate volume pricing early, build abstraction layer for multi-provider |
| **Poor lip-sync quality**             | Low        | Critical | Quality checks before delivery, refund policy for failures                 |
| **Competitor copies mobile approach** | High       | Medium   | Move fast, build brand loyalty, focus on creator community                 |
| **App Store rejection**               | Low        | High     | Follow guidelines strictly, have web fallback                              |
| **Credit card fraud**                 | Medium     | Medium   | Polar handles most, add velocity limits                                    |
| **Copyright/legal concerns**          | Low        | Medium   | Terms of service, user attestation of content ownership                    |

## Immediate Next Steps

### Week 1-2: Technical Foundation
- Set up Cloudflare account
- Initialize Expo project
- Set up Drizzle ORM
- Implement Better Auth flow
- Test Replicate API integration

### Week 3-4: Core Flow
- Build upload flow
- Implement job queue system
- Build video processing worker
- Create basic UI

### Week 5-6: Payments & Polish
- Integrate Polar Payments
- Implement credit system
- Build onboarding flow
- Add thumbnail/preview generation

### Week 7-8: Launch Prep
- App Store assets
- TestFlight beta
- Bug fixes and optimization
- Submit to App Store review
- Prepare launch marketing content

## Summary
Mirai Dub AI has a clear market opportunity at the intersection of Creator Economy growth and AI video technology maturation. The mobile-first approach is a genuine differentiator.

**Key success factors:**
- **Quality:** The HeyGen lip-sync must deliver on the "can't tell it's AI" promise
- **Speed:** Sub-10-minute turnaround
- **Simplicity:** 3-tap experience
- **Distribution:** Leverage creators' own content

The moat isn't the AI (that's commoditizing). The moat is the mobile-native experience + creator community + workflow integration. Build the best product for the creator workflow, and you win.
