# EcoSphere — Git Setup & Deployment Guide

This guide contains the exact, copy-pasteable commands to link your repository to your **second GitHub ID** and deploy to **Vercel**.

---

## Part 1: Configure Git for Your Second Account

Open PowerShell or Command Prompt inside the `ECOSHPERE` directory:

```bash
cd c:\Users\Asus\OneDrive\Desktop\Projects\ECOSHPERE
```

Set your identity **locally for this repository only** (does not change your global Git settings):

```bash
git config user.name "YourNewGitHubUsername"
git config user.email "your-new-email@example.com"
```

Verify the identity:
```bash
git config user.name
git config user.email
```

---

## Part 2: Stage, Commit & Push to GitHub

### 1. Stage All Files
```bash
git add .
```

### 2. Verify Ignored Files
Make sure secrets and dependencies are NOT staged (they should stay ignored):
```bash
git status
```
*(You will see source code files in green. You will NOT see `.env.local` or `node_modules`.)*

### 3. Create the Initial Commit
```bash
git commit -m "feat: EcoSphere unified atmospheric observatory"
```

### 4. Create Repository on GitHub & Link Remote
1. Go to [github.com/new](https://github.com/new) on your second GitHub account.
2. Create a new repository named `ECOSHPERE` (Public or Private).
3. Do **not** initialize with README or .gitignore (we already have them).
4. Run:
```bash
git remote add origin https://github.com/YourNewGitHubUsername/ECOSHPERE.git
git push -u origin main
```

---

## Part 3: Deploy to Vercel in 2 Minutes

Because EcoSphere is now a **Unified Next.js Web App**, Vercel deployment is 1-click:

1. Go to [vercel.com/new](https://vercel.com/new) and import your `ECOSHPERE` GitHub repository.
2. In the **Project Configuration** screen:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click **Edit** and select `frontend` *(Important: select the `frontend` folder)*
   * **Build Command:** `npm run build` (Default)
   * **Output Directory:** `.next` (Default)
3. Expand **Environment Variables** and add:
   * `OPENAQ_API_KEY` for live station data.
   * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your production Clerk instance.
   * `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the EcoSphere Supabase project.
4. Configure your custom domain and Clerk DNS records for production login. Enable the Supabase integration in the production Clerk instance and register its Clerk domain in Supabase Third-Party Auth. Apply any pending migrations from the repository root.
5. Click **Deploy**, then verify sign-in, personal settings, and badge progress on the deployed URL.

Vercel hosts the Next.js UI and AQI API routes together.

---

## Local Development Shortcut
To start the app anytime on your local machine:
```bash
cd c:\Users\Asus\OneDrive\Desktop\Projects\ECOSHPERE\frontend
npm run dev
```
Then visit [http://localhost:3000](http://localhost:3000).
