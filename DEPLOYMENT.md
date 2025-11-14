# Deployment Guide - BlackMatter ERP

This guide will walk you through deploying the BlackMatter ERP application to production.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
4. **GitHub Account**: For version control

## Step 1: Set Up Supabase

### 1.1 Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `blackmatter-erp`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 1.2 Run Database Migrations

1. Go to SQL Editor in Supabase dashboard
2. Open `supabase/schema.sql` from this repository
3. Copy and paste the entire SQL into the editor
4. Click "Run" to execute
5. Repeat for `supabase/rls-policies.sql`

### 1.3 Set Up Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create a new bucket:
   - Name: `project-files`
   - Public: No (private)
   - File size limit: 50MB
3. Create another bucket:
   - Name: `invoices`
   - Public: No (private)
   - File size limit: 10MB

### 1.4 Configure Storage Policies

Run this SQL in the SQL Editor:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Allow users to read files they have access to
CREATE POLICY "Users can read project files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-files');
```

### 1.5 Deploy Edge Functions

**Option A: Using npx (Recommended - No global install needed)**

1. Login to Supabase:
```bash
npx supabase login
```

2. Link your project:
```bash
npx supabase link --project-ref your-project-ref
```
(Find your project ref in Project Settings → API)

3. Deploy functions:
```bash
npx supabase functions deploy calculate-commission
npx supabase functions deploy generate-invoice-pdf
```

4. Set function secrets (if needed):
```bash
npx supabase secrets set RAZORPAY_KEY_SECRET=your_secret
```

**Option B: Install globally (if you have permissions)**

If you prefer global installation, you have a few options:

1. **Using sudo (not recommended for security):**
```bash
sudo npm install -g supabase
```

2. **Fix npm permissions (better long-term solution):**
```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# Add to your ~/.zshrc or ~/.bash_profile
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Reload your shell
source ~/.zshrc

# Now install without sudo
npm install -g supabase
```

3. **Use Homebrew (macOS):**
```bash
brew install supabase/tap/supabase
```

After installation with any method, use the commands:
```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy calculate-commission
supabase functions deploy generate-invoice-pdf
```

## Step 2: Set Up Razorpay

### 2.1 Create Razorpay Account

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get your API keys from Settings → API Keys

### 2.2 Configure Webhooks

1. Go to Settings → Webhooks in Razorpay dashboard
2. Add webhook URL: `https://your-domain.com/api/razorpay/webhook`
3. Enable events:
   - `payment.captured`
   - `payment.failed`
4. Copy the webhook secret

## Step 3: Deploy to Vercel

### 3.1 Prepare Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 3.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3.3 Set Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: Never commit these keys to your repository!

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 4: Post-Deployment Configuration

### 4.1 Update Razorpay Webhook URL

1. Update the webhook URL in Razorpay dashboard to your Vercel domain
2. Test the webhook using Razorpay's test mode

### 4.2 Configure Custom Domain (Optional)

1. In Vercel, go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 4.3 Set Up Email (Supabase)

1. Go to Authentication → Settings in Supabase
2. Configure SMTP settings for email verification
3. Or use Supabase's built-in email service

## Step 5: Testing

### 5.1 Test Authentication

1. Visit your deployed app
2. Try signing up with a new account
3. Check email for verification link
4. Test login with magic link

### 5.2 Test Payments

1. Create a test invoice
2. Try making a payment (use Razorpay test mode)
3. Verify webhook receives payment events
4. Check database for payment records

### 5.3 Test Commission Calculation

1. Create a lead with a referrer
2. Convert lead to project
3. Create and pay an invoice
4. Verify commission is calculated automatically

## Step 6: Monitoring & Maintenance

### 6.1 Set Up Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Supabase Logs**: Monitor in Supabase dashboard
3. **Error Tracking**: Consider adding Sentry or similar

### 6.2 Database Backups

1. Supabase automatically backs up your database
2. Manual backups: Go to Database → Backups in Supabase
3. Set up scheduled backups if needed

### 6.3 Performance Optimization

1. Enable Supabase connection pooling
2. Add database indexes for frequently queried columns
3. Use Vercel Edge Functions for API routes if needed

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Check if policies are correctly applied
   - Verify user roles in profiles table
   - Test queries in Supabase SQL Editor

2. **Webhook Not Receiving Events**
   - Verify webhook URL is correct
   - Check webhook secret matches
   - Review Razorpay webhook logs

3. **Edge Functions Not Deploying**
   - Check Supabase CLI is logged in
   - Verify project ref is correct
   - Check function code for syntax errors

4. **Environment Variables Not Loading**
   - Restart Vercel deployment after adding variables
   - Verify variable names match exactly
   - Check for typos in variable values

## Security Checklist

- [ ] All environment variables are set
- [ ] Service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] Webhook signature verification is enabled
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Database backups are configured
- [ ] API rate limiting is considered
- [ ] CORS is properly configured

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Vercel documentation: https://vercel.com/docs
3. Check Razorpay documentation: https://razorpay.com/docs

## Next Steps

1. Set up CI/CD pipeline
2. Add automated testing
3. Configure staging environment
4. Set up monitoring and alerts
5. Plan for scaling

