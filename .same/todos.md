# PNG eGP System - Development Tracker

## Completed Features

### Core System
- [x] Project setup with Next.js 15, React 18, TypeScript
- [x] Zustand state management stores
- [x] shadcn UI components with custom styling
- [x] Role-Based Access Control (RBAC)
- [x] Immutable audit logging system

### Planning Module
- [x] Annual procurement plans
- [x] Plan consolidation
- [x] Procurement calendar

### Sourcing Module
- [x] Tender management (create, edit, publish)
- [x] Bidder Portal with subscription check
- [x] Sealed Bid Encryption (AES-256-GCM)
- [x] Bid Opening Management

### Contract Management
- [x] Contract creation and tracking
- [x] Milestones management
- [x] Variations tracking

### Supplier Management
- [x] Supplier registry
- [x] Pre-qualification
- [x] Subscription System - Required to bid on contracts

### Authentication
- [x] Supabase Auth integration
- [x] Login/Signup/Password reset pages
- [x] AuthProvider for session management
- [x] Route protection middleware

### Subscription System
- [x] Subscription plans (Basic, Standard, Premium, Enterprise)
- [x] Subscription checkout with payment options
- [x] Subscription status page for suppliers
- [x] Subscription gate component
- [x] Bidder portal integration
- [x] NPC Admin payment verification page

### AI Governance Framework
- [x] AI configuration and governance rules
- [x] Phase 1 AI modules (spend classification, duplicate detection, price benchmarking)
- [x] AI governance dashboard for NPC administrators
- [x] Explainability and audit logging for AI decisions

### Email Notifications (NEW)
- [x] Email template system with HTML/text versions
- [x] Tender published notifications
- [x] Bid submission confirmations
- [x] Award notifications
- [x] Subscription activation/expiry alerts
- [x] Approval workflow notifications
- [x] Contract milestone reminders
- [x] Email service with Resend/SendGrid support

### File Upload (NEW)
- [x] Supabase Storage integration
- [x] File validation (type, size)
- [x] Multiple file upload component
- [x] Storage buckets for different document types
- [x] Signed URLs for private files

### Internationalization (NEW)
- [x] English language support
- [x] Tok Pisin language support
- [x] Language context provider
- [x] Language switcher component
- [x] Persistent language preference

### Documentation (NEW)
- [x] User onboarding guide
- [x] Supplier registration walkthrough
- [x] Bidding process documentation
- [x] NPC officer administration guide

## Subscription Plans

| Plan | Price | Bids | Tender Limit |
|------|-------|------|--------------|
| Basic | K2,500/year | 5 | K500,000 |
| Standard | K5,000/year | 15 | K2,000,000 |
| Premium | K10,000/year | 50 | Unlimited |
| Enterprise | K25,000/year | Unlimited | Unlimited |

## Database Setup

### Migrations Ready
1. `supabase/migrations/001_initial_schema.sql` - Main database schema
2. `supabase/migrations/002_subscription_schema.sql` - Subscription system

### To Run Migrations:
1. Go to Supabase Dashboard > SQL Editor
2. Run `001_initial_schema.sql` first
3. Run `002_subscription_schema.sql` second

### Storage Buckets to Create:
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES
  ('tender-documents', 'tender-documents', true),
  ('bid-documents', 'bid-documents', false),
  ('contract-documents', 'contract-documents', false),
  ('supplier-documents', 'supplier-documents', false),
  ('profile-images', 'profile-images', true),
  ('payment-proofs', 'payment-proofs', false);
```

## Pending Features

### High Priority
- [ ] Run database migrations in Supabase SQL Editor
- [ ] Create storage buckets in Supabase
- [ ] Configure email provider (Resend/SendGrid)

### Medium Priority
- [ ] Mobile-responsive refinements
- [ ] PDF report generation improvements
- [ ] Real-time bid notifications

### Future Phases
- [ ] Phase 2 AI modules (compliance check, supplier chatbot)
- [ ] Phase 3 AI modules (risk scoring, anomaly detection)
- [ ] Integration with IFMS/finance systems
- [ ] Mobile app (PWA enhancements)

## GitHub Repository
- URL: https://github.com/npcpng/eGP.git

## Environment Configuration
- Supabase Project: kwcrfhtlubtieejkaedx
- Demo Mode: Enabled (NEXT_PUBLIC_DEMO_MODE=true)

## New Files Added
- `src/lib/email/email-templates.ts` - Email notification templates
- `src/lib/email/email-service.ts` - Email sending service
- `src/lib/storage/file-upload.ts` - Supabase Storage file upload
- `src/components/upload/file-upload.tsx` - File upload component
- `src/lib/i18n/translations.ts` - English & Tok Pisin translations
- `src/lib/i18n/language-context.tsx` - Language provider
- `src/components/language/language-switcher.tsx` - Language switcher
- `docs/USER-ONBOARDING.md` - User onboarding documentation

## Tech Stack (Updated)
- **Next.js**: 16.1.2 (upgraded from 15.5.9)
- **React**: 19.2.3 (upgraded from 18.3.1)
- **React-DOM**: 19.2.3
- **TypeScript**: 5.8.3
- **Tailwind CSS**: 3.4.17

## Last Updated
- Version: 36
- Date: 2026-01-15
- Last Push: ✅ Completed - Next.js 16 & React 19 upgrade deployed to GitHub
