# Troubleshooting Guide

## 500 Internal Server Error on localhost:3000

### Common Causes & Solutions

### 1. Missing Environment Variables

**Error**: `Failed to initialize Supabase client`

**Solution**: Create `.env.local` file with required variables:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to get Supabase keys:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Not Set Up

**Error**: `relation "profiles" does not exist`

**Solution**: Run the database migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste contents of `supabase/schema.sql`
3. Click "Run"
4. Copy and paste contents of `supabase/rls-policies.sql`
5. Click "Run"

### 3. Restart Development Server

After adding environment variables, **restart the dev server**:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### 4. Check Server Logs

Look at your terminal where `npm run dev` is running. The actual error message will be shown there.

Common errors you might see:

- `NEXT_PUBLIC_SUPABASE_URL is not defined` → Missing env variable
- `Invalid API key` → Wrong Supabase key
- `relation "profiles" does not exist` → Database not migrated
- `permission denied` → RLS policies blocking access

### 5. Verify Environment Variables Are Loaded

Create a test route to check:

```typescript
// app/test-env/route.ts
export async function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  })
}
```

Visit `http://localhost:3000/test-env` to check.

### 6. Clear Next.js Cache

Sometimes Next.js caches cause issues:

```bash
# Delete .next folder
rm -rf .next

# Restart dev server
npm run dev
```

### 7. Check Node Version

Make sure you're using Node.js 18+:

```bash
node --version
# Should be v18.x.x or higher
```

### Quick Fix Checklist

- [ ] Created `.env.local` file
- [ ] Added all required environment variables
- [ ] Restarted the dev server after adding env vars
- [ ] Ran database migrations in Supabase
- [ ] Checked terminal for actual error message
- [ ] Verified Supabase project is active
- [ ] Cleared `.next` cache if needed

### Still Having Issues?

1. **Check the terminal output** - The actual error will be shown there
2. **Check browser console** - Look for additional error messages
3. **Verify Supabase connection** - Test in Supabase dashboard SQL Editor
4. **Check Next.js version** - Should be 14.0.4 or compatible

### Common Error Messages

| Error | Solution |
|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Add to `.env.local` |
| `Invalid API key` | Check Supabase keys are correct |
| `relation "profiles" does not exist` | Run `schema.sql` migration |
| `permission denied for table` | Run `rls-policies.sql` |
| `cookies is not a function` | Update Next.js to 14+ |
| `Module not found` | Run `npm install` |

