# Deploying Tosslee to Vercel

## Prerequisites
1. A GitHub account
2. A Vercel account (free at vercel.com)
3. Your Supabase project already set up

## Step 1: Prepare Your Code

### 1.1 Create a `.gitignore` file if you don't have one:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Windows
*.Zone.Identifier
```

### 1.2 Clean up Zone.Identifier files (Windows WSL):
```bash
find . -name "*.Zone.Identifier" -type f -delete
```

## Step 2: Push to GitHub

### 2.1 Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit - Tosslee decluttering game"
```

### 2.2 Create a new repository on GitHub:
1. Go to https://github.com/new
2. Name it "tosslee" or "keeportoss"
3. Don't initialize with README (you already have one)
4. Create repository

### 2.3 Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tosslee.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Connect to Vercel:
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure your project:
- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` (default)
- **Output Directory**: Leave empty (default)

### 3.3 Add Environment Variables:
Click on "Environment Variables" and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these from your Supabase project:
1. Go to your Supabase dashboard
2. Settings → API
3. Copy the values

### 3.4 Deploy:
Click "Deploy" and wait for the build to complete!

## Step 4: Set up your custom domain (optional)

1. In Vercel project settings → Domains
2. Add your domain (e.g., tosslee.com)
3. Follow DNS configuration instructions

## Step 5: Update Supabase settings

### 5.1 Add your Vercel URL to Supabase:
1. Go to Supabase → Authentication → URL Configuration
2. Add your Vercel URLs to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: 
     - `https://your-app.vercel.app/*`
     - `https://your-app.vercel.app/auth/callback`

### 5.2 Update CORS settings (if needed):
In Supabase Storage → Policies, ensure your storage buckets allow your domain.

## Step 6: Post-deployment checklist

- [ ] Test user registration/login
- [ ] Test image uploads
- [ ] Test the game modes
- [ ] Check that decisions are saving
- [ ] Verify inventory sharing works
- [ ] Test on mobile devices

## Troubleshooting

### "Infinite recursion" errors:
Run these SQL commands in Supabase:
```sql
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
```

### Images not uploading:
Check Supabase Storage policies and ensure your bucket is public.

### Authentication not working:
Double-check your redirect URLs in Supabase match your Vercel domain.

## Updating your deployment

After making changes:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

## Environment Variables Reference

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional but recommended:**
- `SUPABASE_SERVICE_ROLE_KEY` - For game features to work properly

## Success! 🎉

Your app should now be live at:
- `https://your-project-name.vercel.app`

Share it with friends and start decluttering!