# ThisMeetingCosts.io

Watch your meeting's cost tick up in real time. Because someone should be keeping track.

## Quick Start (Local Development)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create thismeetingcosts --public --push
```

Or create a repo manually at github.com/new, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/thismeetingcosts.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `thismeetingcosts` repo
4. Framework preset will auto-detect as Vite — leave defaults
5. Click "Deploy"
6. Your site is live at `thismeetingcosts.vercel.app` in ~60 seconds

### Step 3: Custom Domain
1. Buy `thismeetingcosts.io` on [Namecheap](https://namecheap.com) (~$35/yr)
2. In Vercel dashboard → Settings → Domains → Add `thismeetingcosts.io`
3. Update your domain's DNS nameservers to Vercel's (Vercel will show you exactly what to set)
4. SSL is automatic. You're live.

### Step 4: Add OG Image (for social sharing)
Create a 1200x630px image and save as `public/og-image.png`. This is what shows up when people share the link on LinkedIn/Twitter.

## Tech Stack
- React 18
- Vite
- Deployed on Vercel
- No backend, no database, no dependencies beyond React
