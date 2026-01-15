# PNG eGP System

**National e-Government Procurement System for Papua New Guinea**

A comprehensive digital procurement platform designed to modernize and streamline government procurement processes across Papua New Guinea.

## Features

### For Government Agencies
- **Tender Management** - Create, publish, and manage tenders with sealed bid encryption
- **Evaluation Workspace** - Score bids with conflict of interest declarations
- **Contract Management** - Track contracts, milestones, and variations
- **Approval Workflows** - Multi-step approval processes for plans, awards, and contracts
- **Analytics Dashboard** - KPIs, compliance tracking, and procurement reports

### For Suppliers
- **Bidder Portal** - Discover and bid on government opportunities
- **Subscription System** - Choose from Basic, Standard, Premium, or Enterprise plans
- **Secure Bid Submission** - AES-256-GCM encrypted sealed bids
- **Contract Tracking** - View awarded contracts and milestones

### For NPC Administrators
- **Payment Verification** - Verify supplier subscription payments
- **User Management** - Manage users, roles, and permissions
- **Audit Logs** - Immutable audit trail of all system actions
- **OCDS Export** - Open Contracting Data Standard compliance

## Subscription Plans

| Plan | Price (PGK) | Duration | Max Bids | Tender Limit |
|------|-------------|----------|----------|--------------|
| Basic | K2,500 | 12 months | 5 | K500,000 |
| Standard | K5,000 | 12 months | 15 | K2,000,000 |
| Premium | K10,000 | 12 months | 50 | Unlimited |
| Enterprise | K25,000 | 12 months | Unlimited | Unlimited |

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Encryption**: Web Crypto API (AES-256-GCM)

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/npcpng/eGP.git
   cd eGP
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run database migrations**

   Go to your Supabase dashboard > SQL Editor and run:
   - `supabase/migrations/001_initial_schema.sql` (main schema)
   - `supabase/migrations/002_subscription_schema.sql` (subscription system)

5. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Open the application**

   Visit http://localhost:3000

## Project Structure

```
png-egp-system/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── admin/             # Admin pages
│   │   ├── api/               # API routes
│   │   ├── tenders/           # Tender management
│   │   ├── contracts/         # Contract management
│   │   ├── suppliers/         # Supplier management
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── subscription/     # Subscription components
│   ├── lib/                   # Utilities
│   │   ├── supabase/         # Supabase clients
│   │   ├── encryption.ts     # Bid encryption
│   │   └── ...
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript types
├── supabase/
│   └── migrations/           # SQL migrations
├── docs/                     # Documentation
└── public/                   # Static assets
```

## Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Main dashboard with KPIs |
| Login | `/login` | User authentication |
| Signup | `/signup` | Supplier registration |
| Subscribe | `/subscribe` | Subscription plans |
| Bidder Portal | `/tenders/bidder-portal` | Browse and bid on tenders |
| My Subscription | `/suppliers/subscription` | View subscription status |
| Admin Payments | `/admin/subscriptions` | Verify subscription payments |
| Tenders | `/tenders` | Manage tenders |
| Contracts | `/contracts` | Manage contracts |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode (true/false) | No |

## Database Schema

The system uses 35+ tables including:

- **Core**: organizations, users, suppliers
- **Procurement**: tenders, bids, evaluations, contracts
- **Subscriptions**: subscription_plans, supplier_subscriptions, subscription_payments
- **Audit**: audit_logs, approval_workflows

See `/supabase/migrations/` for complete schema.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/test-connection` | GET | Test Supabase connection |
| `/api/auth/profile` | GET/POST/PUT | User profile management |
| `/auth/callback` | GET | Auth callback for OAuth/email |

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with build command: `bun run build`
4. Output directory: `.next`

### Vercel

1. Import project from GitHub
2. Configure environment variables
3. Deploy automatically

## Documentation

- [System Documentation](/docs/SYSTEM-DOCUMENTATION.md)
- [User Guide](/docs/USER-GUIDE.md)
- [Supabase Setup](/docs/SUPABASE-SETUP.md)
- [Project Proposal](/docs/04-FORMAL-PROPOSAL.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is developed for the National Procurement Commission of Papua New Guinea.

## Support

For support, contact:
- Email: support@npc.gov.pg
- Website: https://npc.gov.pg

---

Built with [Same](https://same.new)
