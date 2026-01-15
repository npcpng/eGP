# How to Get Your Supabase API Keys

## Quick Reference

Your Supabase Project:
- **Project Name:** eGovernment Procurement
- **Project ID:** kwcrfhtlubtieejkaedx
- **URL:** https://kwcrfhtlubtieejkaedx.supabase.co

## Step-by-Step Guide

### Step 1: Open Supabase Dashboard

Go to: **https://supabase.com/dashboard/project/kwcrfhtlubtieejkaedx/settings/api**

Or navigate manually:
1. Go to https://supabase.com/dashboard
2. Login to your account
3. Select project "eGovernment Procurement"
4. Click **Settings** (gear icon) in the left sidebar
5. Click **API** in the settings menu

### Step 2: Find Project API Keys

On the API settings page, look for the **"Project API keys"** section.

You'll see two keys:

| Key Name | Usage | Starts With |
|----------|-------|-------------|
| **anon public** | Browser/client-side requests | `eyJhbGciOiJIUzI1NiIs...` |
| **service_role secret** | Server-side admin operations | `eyJhbGciOiJIUzI1NiIs...` |

### Step 3: Copy the Keys

Click the **copy** button next to each key.

**Important:** Both keys should start with `eyJ` (they are JWT tokens).

### Step 4: Update .env.local

Open `.env.local` in the project and update:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...paste_full_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...paste_full_service_role_key_here
```

### Step 5: Test the Connection

Run the test script:

```bash
bun run scripts/test-supabase-connection.ts
```

## Troubleshooting

### Keys starting with "sb_publishable_" or "sb_secret_"

If you see keys like:
- `sb_publishable_iRZ08svXERoqyMBgVVqXng_Avw5dPT_`
- `sb_secret_RGapAQ5WhhkFK2yOqi_8yw_EJoOEMLU`

These are from a different section. Look for the **"Project API keys"** section specifically, which has JWT-formatted keys starting with `eyJ`.

### Can't Find the Keys

1. Make sure you're logged into the correct Supabase account
2. Verify you have access to the project
3. Check if you're on the correct project (kwcrfhtlubtieejkaedx)

### Connection Errors

If you get "Invalid API key" errors:
- Ensure you copied the complete key (they are long strings)
- Check there are no extra spaces or newlines
- Verify the key matches the project URL

## What the Keys Look Like

**Anon Key Example (truncated):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y3JmaHRsdWJ0aWVlamthZWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk...
```

**Service Role Key Example (truncated):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y3JmaHRsdWJ0aWVlamthZWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOS4...
```

Both keys:
- Start with `eyJ`
- Are very long (200+ characters)
- Are base64-encoded JWT tokens

## Security Notes

⚠️ **NEVER commit `.env.local` to Git!**

The file is already in `.gitignore`, but always verify:
- The `anon` key is safe to expose in browser code
- The `service_role` key is SECRET and should only be used server-side
- Never share the service_role key publicly

## Next Steps After Configuration

1. **Run Database Migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Paste contents of `supabase/migrations/001_initial_schema.sql`
   - Click Run

2. **Create Test User:**
   - Go to Authentication → Users
   - Click "Add User"
   - Create a test account

3. **Start the Application:**
   ```bash
   bun run dev
   ```

4. **Test the Connection:**
   ```bash
   bun run scripts/test-supabase-connection.ts
   ```
