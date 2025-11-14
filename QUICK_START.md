# Quick Start Guide - BlackMatter ERP

## Immediate Steps to Fix Supabase CLI Installation

You're getting a permission error. Here are your options:

### ✅ Option 1: Use npx (Easiest - No Installation Needed)

Just use `npx` instead of installing globally:

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Deploy functions
npx supabase functions deploy calculate-commission
npx supabase functions deploy generate-invoice-pdf
```

**This is the recommended approach** - no permission issues, no global installs needed.

---

### Option 2: Fix npm Permissions (Better Long-term)

If you want to install globally, fix npm permissions:

```bash
# 1. Create a directory for global packages
mkdir ~/.npm-global

# 2. Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# 3. Add to your shell profile (~/.zshrc for zsh)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# 4. Reload your shell
source ~/.zshrc

# 5. Now install without sudo
npm install -g supabase
```

---

### Option 3: Use Homebrew (macOS)

If you have Homebrew installed:

```bash
brew install supabase/tap/supabase
```

---

### Option 4: Use sudo (Not Recommended)

Only if you really need it:

```bash
sudo npm install -g supabase
```

⚠️ **Warning**: Using sudo with npm can cause security issues and permission problems later.

---

## Complete Setup Steps

### 1. Install Dependencies

```bash
cd /Users/mukeshayudh/Documents/blackmatter
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
- Supabase URL and keys
- Razorpay keys
- App URL

### 3. Set Up Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Run `supabase/schema.sql`
5. Run `supabase/rls-policies.sql`

### 4. Deploy Edge Functions (Using npx)

```bash
# Login
npx supabase login

# Link project (get project ref from Supabase dashboard)
npx supabase link --project-ref your-project-ref

# Deploy functions
npx supabase functions deploy calculate-commission
npx supabase functions deploy generate-invoice-pdf
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Troubleshooting

### Permission Errors
- Use `npx` instead of global install
- Or fix npm permissions (Option 2 above)

### Database Connection Issues
- Check your Supabase URL and keys in `.env.local`
- Verify RLS policies are applied correctly

### Function Deployment Issues
- Make sure you're logged in: `npx supabase login`
- Check your project ref is correct
- Verify you have the correct permissions in Supabase

---

## Next Steps

1. ✅ Fix Supabase CLI installation (use npx)
2. ✅ Set up environment variables
3. ✅ Run database migrations
4. ✅ Deploy edge functions
5. ✅ Start development server
6. ✅ Test the application

For detailed deployment instructions, see `DEPLOYMENT.md`

