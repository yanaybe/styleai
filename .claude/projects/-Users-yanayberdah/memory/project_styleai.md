---
name: project-styleai
description: StyleAI — personal AI stylist app built exclusively for Talia Biton (user's girlfriend)
metadata:
  type: project
---

StyleAI is a personal AI stylist app built exclusively for **Talia Biton** (Yanay's girlfriend). It is NOT a public SaaS — it's a personal gift/tool just for her.

**User:** Yanay Berdah (builder/boyfriend)
**End user:** Talia Biton (the one who uses the app daily)

**Stack:** Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui, Supabase (Auth + PostgreSQL), Prisma 5, Cloudinary, OpenAI GPT-4o, Twilio WhatsApp, Tomorrow.io, Upstash, Vercel.

**Live:** https://styleai-chi.vercel.app
**GitHub:** https://github.com/yanaybe/styleai
**Supabase project:** xrguhumhhwszuwtkipop

**No Stripe / No payments:** Free forever — no plan gating.
**No Google OAuth:** Only email/password auth. Just for Talia.

**All UI/copy personalized for Talia** — not generic SaaS copy.

**Key decisions:**
- Supabase Auth (email only, no Google)
- pgvector not used yet (embeddings future work)
- Cloudinary for clothing images
- Twilio WhatsApp sandbox
- Morning WhatsApp message = personal to Talia
- Outfit images: Phase 1 = Cloudinary flat-lay

**Build order completed:**
1. Foundation (auth, DB, Next.js) ✅
2. Wardrobe (upload + AI classification) ✅
3. Style profile ✅
4. WhatsApp webhook ✅
5. Outfit generation (3 options: safe/stylish/trendy) ✅
6. Outfit history + rating ✅
7. Inspiration/Pinterest recreation ✅
8. Shopping assistant ✅
9. Packing assistant ✅
10. Couples mode ✅

**Remaining:** Daily morning WhatsApp cron (skipped by user request for now)

**Why:** Personal gift from Yanay to Talia — make her mornings easier.
**How to apply:** All copy, greetings, and messages should be addressed to Talia personally, not generic users.
