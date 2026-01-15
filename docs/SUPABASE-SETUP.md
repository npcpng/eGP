# Supabase Database Setup Guide

## Overview

This guide explains how to set up the Supabase backend for the PNG eGP System.

## Step 1: Get Your API Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **eGovernment Procurement**
3. Navigate to: **Settings** → **API**
4. Copy the following keys:

| Key | Location | Usage |
|-----|----------|-------|
| **anon (public)** | Project API keys | Browser/client-side requests |
| **service_role (secret)** | Project API keys | Server-side admin operations |

## Step 2: Configure Environment Variables

Update `.env.local` with your keys:

```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://kwcrfhtlubtieejkaedx.supabase.co

# Anon key (safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_anon_key

# Service role key (server only - NEVER expose in browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_service_role_key
```

## Step 3: Run Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run**

This will create:
- All database tables
- Enum types
- Indexes
- Row Level Security policies
- Triggers for auto-updating timestamps
- Initial data (NPC organization, sample agencies)

## Step 4: Verify Tables

After running the migration, verify these tables exist in **Database** → **Tables**:

### Core Tables
- `organizations` - Government agencies
- `users` - System users
- `suppliers` - Registered suppliers

### Planning
- `annual_procurement_plans`
- `procurement_plan_items`

### Sourcing
- `tenders`
- `tender_documents`
- `tender_clarifications`
- `tender_addenda`
- `evaluation_criteria`

### Bids
- `bids`
- `bid_documents`
- `bid_opening_sessions`
- `bid_opening_committee`

### Evaluation
- `evaluations`
- `evaluation_committee_members`
- `bid_evaluations`
- `criteria_scores`

### Contracts
- `contracts`
- `contract_milestones`
- `contract_variations`
- `contract_payments`

### Workflows
- `approval_workflows`
- `approval_steps`
- `audit_logs`

### Marketplace
- `catalog_items`
- `framework_agreements`
- `purchase_orders`
- `purchase_order_items`

### Auctions
- `auctions`
- `auction_bids`
- `asset_disposals`

### Other
- `supplier_classifications`
- `supplier_qualifications`
- `supplier_ratings`
- `notifications`

## Step 5: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates if needed

### Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Set site URL: `http://localhost:3000` (development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - Your production URLs

## Step 6: Configure Storage (For File Uploads)

1. Go to **Storage**
2. Create buckets:
   - `tender-documents` - Public read, authenticated write
   - `bid-documents` - Private, authenticated access only
   - `contract-documents` - Private
   - `supplier-documents` - Private

3. Set bucket policies:

```sql
-- Allow public read for tender documents
CREATE POLICY "Public tender docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'tender-documents');

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

## Step 7: Enable Real-time

1. Go to **Database** → **Replication**
2. Enable replication for real-time tables:
   - `bids` (for live bid updates)
   - `auction_bids` (for live auction)
   - `notifications` (for alerts)
   - `approval_workflows` (for workflow updates)

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ORGANIZATIONS                              │
│   └── users                                                          │
│   └── annual_procurement_plans                                       │
│       └── procurement_plan_items                                     │
│   └── tenders                                                        │
│       ├── tender_documents                                           │
│       ├── evaluation_criteria                                        │
│       ├── tender_clarifications                                      │
│       ├── tender_addenda                                             │
│       └── bid_opening_sessions                                       │
│           └── bid_opening_committee                                  │
│                                                                      │
│                           SUPPLIERS                                   │
│   └── supplier_classifications                                       │
│   └── supplier_qualifications                                        │
│   └── bids                                                           │
│       └── bid_documents                                              │
│   └── catalog_items                                                  │
│   └── auction_bids                                                   │
│                                                                      │
│                           CONTRACTS                                   │
│   └── contract_milestones                                            │
│   └── contract_variations                                            │
│   └── contract_payments                                              │
│                                                                      │
│                           WORKFLOWS                                   │
│   └── approval_workflows                                             │
│       └── approval_steps                                             │
│   └── audit_logs (immutable)                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Row Level Security (RLS)

The schema includes RLS policies for:

1. **Public Tenders** - Anyone can view published tenders
2. **Supplier Bids** - Suppliers can only view their own bids
3. **User Notifications** - Users can only view their own notifications

Additional policies should be added based on your security requirements.

## API Services

The system includes API service functions in `/src/lib/supabase/api.ts`:

- `tenderService` - Tender CRUD operations
- `bidService` - Bid management
- `supplierService` - Supplier registry
- `contractService` - Contract management
- `workflowService` - Approval workflows
- `auditService` - Audit logging
- `marketplaceService` - Catalogue and purchase orders
- `auctionService` - Auction operations
- `userService` - User management
- `notificationService` - Notifications

## Testing the Connection

After setup, test the connection:

```typescript
import { getSupabaseClient } from '@/lib/supabase';

const client = getSupabaseClient();

// Test query
const { data, error } = await client
  .from('organizations')
  .select('*')
  .limit(1);

if (error) {
  console.error('Connection failed:', error);
} else {
  console.log('Connected successfully:', data);
}
```

## Troubleshooting

### "Invalid API key"
- Check that you copied the full key including `eyJ...`
- Ensure the key matches the project URL

### "relation does not exist"
- Run the migration SQL first
- Check the SQL ran without errors

### "new row violates row-level security"
- Check RLS policies are configured correctly
- Ensure user is authenticated for protected tables

### "permission denied"
- Using anon key for admin operations? Use service_role key on server
- Check RLS policies match user role

## Next Steps

After setup:

1. Create test users in Supabase Auth
2. Add sample data through the UI
3. Test API connections from the application
4. Configure production environment variables
5. Set up backup and monitoring

## Support

For issues with the eGP system, contact:
- **Email:** support@npc.gov.pg
- **GitHub:** https://github.com/npcpng/eGP
