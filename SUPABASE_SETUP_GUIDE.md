# 🚀 Supabase Setup Guide for Shivotsav Dashboard

## Step 1: Create a Supabase Account & Project

1. **Go to Supabase**: https://supabase.com
2. **Sign up** (or log in if you already have an account)
   - You can sign up with GitHub, Google, or Email
3. **Click "New Project"**
4. **Fill in the project details:**
   - **Organization**: Select your organization (or create a new one)
   - **Name**: `Shivotsav Dashboard` (or any name you prefer)
   - **Database Password**: Create a strong password and **SAVE IT** somewhere safe
   - **Region**: Choose the closest region to you (e.g., Mumbai, Singapore)
   - **Pricing Plan**: Select **Free** (it's more than enough for this project)
5. **Click "Create New Project"**
6. **Wait 2-3 minutes** for the project to provision

---

## Step 2: Run the Database Schema

1. Once your project is ready, look for the **SQL Editor** in the left sidebar
   - Icon looks like: `</>`
2. **Click "SQL Editor"** → **"New Query"**
3. **Open the file**: `supabase/schema.sql` from your project folder
4. **Copy ALL the content** from `schema.sql`
5. **Paste it** into the Supabase SQL Editor
6. **Click "RUN"** (or press Ctrl+Enter)
7. You should see: ✅ **"Success. No rows returned"**

This creates all your database tables:
- `colleges` (20 colleges)
- `events` (36 events)
- `scoring_rules` (point system)
- `score_entries` (for tracking scores)

---

## Step 3: Load Sample Data

1. In the **SQL Editor**, click **"New Query"** again
2. **Open the file**: `supabase/seed.sql` from your project folder
3. **Copy ALL the content** from `seed.sql`
4. **Paste it** into the Supabase SQL Editor
5. **Click "RUN"**
6. You should see: ✅ **"Success. No rows returned"**

This populates your database with:
- 20 colleges (Narasimha, Loki, Hanuman, etc.)
- 36 events across 5 departments
- Scoring rules for all event types

---

## Step 4: Get Your API Credentials

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"**
3. You'll see two important values:

### **Project URL** (looks like this):
```
https://xxxxxxxxxxxxx.supabase.co
```
📋 **Copy this entire URL**

### **Service Role Key** (anon key won't work - you need service_role):
- Scroll down to find **"Project API keys"**
- Look for **`service_role`** key (NOT the `anon` key)
- Click the **eye icon** to reveal it
- 📋 **Copy this key** (it's very long)

⚠️ **IMPORTANT**: The `service_role` key is SECRET - never share it publicly or commit it to GitHub!

---

## Step 5: Update Your .env.local File

1. **Open** the file: `.env.local` in your project root
2. **Replace** the placeholder values with your actual credentials:

```env
# Server-only env vars (NEVER prefix with NEXT_PUBLIC_)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
SESSION_SECRET=your-random-secret-string-here
```

**Example with fake values:**
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.abcdefghijklmnopqrstuvwxyz1234567890
SESSION_SECRET=my-super-secret-random-string-at-least-32-chars-long-12345
```

3. **Save the file**

---

## Step 6: Generate a Strong SESSION_SECRET

Your `SESSION_SECRET` should be a random string. Run this in PowerShell to generate one:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use this online generator: https://generate-secret.vercel.app/32

Copy the generated string and paste it as your `SESSION_SECRET` in `.env.local`

---

## Step 7: Restart Your Development Server

1. **Stop** your Next.js server (if it's running)
   - Press `Ctrl+C` in the terminal
2. **Restart** it:
   ```powershell
   npm run dev
   ```
3. **Wait** for it to compile

---

## Step 8: Test the Login

1. **Open** your browser: http://localhost:3000/login
2. **Login with one of these credentials:**

### Admin Account:
- Email: `AjayAdmin90@SHIVOTSAV.COM`
- Password: `Ajadmin@@9898`
- Redirects to: `/admin` (Admin Dashboard)

### CL Account:
- Email: `CLFORSHIVOTSAV@SHIVOTSAV.COM`
- Password: `Shivotsav2026CL@`
- Redirects to: `/` (CL Dashboard)

3. ✅ **You should now see the dashboard with leaderboard data!**

---

## Step 9: Verify Your Data in Supabase

1. Go back to your Supabase project
2. Click **"Table Editor"** in the left sidebar
3. You should see these tables with data:
   - **colleges**: 20 rows
   - **events**: 36 rows
   - **scoring_rules**: 24 rows
   - **score_entries**: 0 rows (will be populated as you assign scores)

---

## 🎉 You're All Set!

Your dashboard is now connected to Supabase and ready to use!

### What You Can Do Now:
- ✅ Login as Admin or CL
- ✅ View the leaderboard
- ✅ Assign points to colleges
- ✅ Deduct points
- ✅ View scoring history

---

## 🔒 Security Notes

1. **Never commit `.env.local` to Git** - it's already in `.gitignore`
2. **The `service_role` key bypasses all security** - keep it secret
3. **Row Level Security (RLS) is enabled** on all tables - only your server can access the data
4. **No one can access your database directly** from the browser

---

## 📝 Troubleshooting

### Error: "Invalid supabaseUrl"
- Check that your `SUPABASE_URL` starts with `https://`
- Make sure there are no extra spaces or quotes

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"
- Make sure you copied the **`service_role`** key, not the `anon` key
- Check for any line breaks or spaces in the key

### Login works but dashboard shows error
- Make sure you ran BOTH `schema.sql` AND `seed.sql`
- Check the Supabase logs: Project Settings → API → Logs

### Still not working?
- Restart your dev server (`Ctrl+C` then `npm run dev`)
- Clear your browser cache
- Check the browser console for errors (F12)

---

## 📚 Useful Supabase Links

- **Dashboard**: https://supabase.com/dashboard
- **Documentation**: https://supabase.com/docs
- **SQL Editor**: Quick way to run queries
- **Table Editor**: Visual interface to view/edit data

---

**Need help?** Check the error messages in your terminal or browser console and refer to the Troubleshooting section above.
