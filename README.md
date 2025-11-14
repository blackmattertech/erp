# BlackMatter ERP

A complete, fully responsive, mobile-first ERP web application for BlackMatter Technologies, built with Next.js and Supabase.

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Edge Functions)
- **Payments**: Razorpay
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Features

### User Roles & Permissions
- Super Admin
- Sales Referrer
- Client
- Freelancer/Contractor
- Project Manager

Each role has specific permissions enforced via Row Level Security (RLS) policies.

### Modules

1. **CRM Module**
   - Lead creation and management
   - Referral ID tracking
   - Lead status pipeline
   - Client company profiles
   - Notes & communication log
   - Sales Referrer dashboard with commission preview
   - Automatic commission calculation (20% on paid invoices)
   - Bonus automation (₹50,000 at 10 completed sales)

2. **Project Management**
   - Project workspace
   - Tasks with assignees
   - Milestones
   - Kanban & Timeline views
   - File management via Supabase Storage
   - Time tracking system (manual + timer)
   - Freelancer dashboard

3. **Freelancer Management**
   - Onboarding form
   - Skills tags
   - Availability toggle
   - Payment dashboard
   - Timesheet approval
   - Automatic earnings calculation

4. **Financial & Accounting**
   - Quote builder (PDF generation via Edge Functions)
   - Invoice system (GST-compliant)
   - Razorpay integration
   - Payment logs
   - Expense management
   - P&L reports
   - Commission automation
   - Bonus automation

5. **Client Portal**
   - View projects
   - View tasks, milestones, files
   - Make payments
   - Download deliverables
   - Chat/communicate with project manager

6. **Service Modules**
   - GST filing workflow
   - Company registration tracker
   - Ecommerce account management system

7. **Reporting & Analytics**
   - Cashflow dashboards
   - Project profitability
   - Sales pipeline
   - Referrer leaderboard
   - Freelancer performance
   - Commission payouts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Razorpay account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blackmatter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay key secret
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., http://localhost:3000)

4. Set up Supabase database:
   - Go to your Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - Run the SQL from `supabase/rls-policies.sql` in the SQL Editor

5. Deploy Supabase Edge Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy calculate-commission
supabase functions deploy generate-invoice-pdf
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Supabase Setup

1. Run database migrations:
   - Execute `supabase/schema.sql`
   - Execute `supabase/rls-policies.sql`

2. Set up Storage buckets:
   - Create a bucket named `project-files` for project files
   - Create a bucket named `invoices` for invoice PDFs
   - Set appropriate RLS policies

3. Configure Razorpay webhook:
   - In Razorpay dashboard, set webhook URL to: `https://your-domain.com/api/razorpay/webhook`
   - Enable events: `payment.captured`

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Supabase: Project Settings → Edge Functions → Secrets

## Project Structure

```
blackmatter/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── crm/               # CRM module pages
│   ├── projects/          # Project management pages
│   ├── invoices/          # Invoice pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   ├── crm/              # CRM components
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── hooks/            # Custom hooks
│   └── types.ts          # TypeScript types
├── supabase/
│   ├── schema.sql        # Database schema
│   ├── rls-policies.sql  # RLS policies
│   └── functions/       # Edge functions
└── ...
```

## Mobile-First Design

The application is built mobile-first, optimized for 360px width:
- Tables convert to cards on mobile
- Sidebar collapses into hamburger menu
- Bottom navigation for mobile
- All UI blocks are responsive for tablets & desktops

## Key Features Implementation

### Commission Calculation
- Automatically calculates 20% commission when an invoice is paid
- Tracks commission in the `commissions` table
- Updates referrer's total commission earned

### Bonus System
- Automatically awards ₹50,000 when a referrer reaches 10 paid clients
- Tracks bonuses in the `bonuses` table
- Updates referrer's bonus earned total

### Invoice PDF Generation
- Edge function generates HTML for invoice PDFs
- Can be converted to PDF using client-side libraries or server-side services

## License

Proprietary - BlackMatter Technologies

## Support

For support, contact the development team.

# erp
# erp
