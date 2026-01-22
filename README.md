# Together KC Site

A password-protected website that displays and allows editing of your Notion workspace. Free alternative to Super.so/Potion.

## Quick Setup (5 minutes)

### 1. Create Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it "Together KC Site"
4. Select your workspace
5. Click "Submit"
6. Copy the "Internal Integration Secret" (starts with `secret_`)

### 2. Connect Integration to Your Pages

1. Open your Together KC Command Center page in Notion
2. Click the `•••` menu in the top right
3. Click "Add connections"
4. Find and select "Together KC Site"
5. Click "Confirm"

**Important:** You must add the connection to every top-level page you want accessible.

### 3. Get Your Page ID

From your Notion page URL:
```
https://www.notion.so/Your-Page-Title-abc123def456...
                                      ^^^^^^^^^^^^^^^^
                                      This is your page ID
```

### 4. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/together-kc-site)

Or manually:

1. Push this code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "Add New Project"
4. Import your GitHub repo
5. Add these Environment Variables:
   - `NOTION_API_KEY` = your secret from step 1
   - `NOTION_ROOT_PAGE_ID` = your page ID from step 3
   - `SITE_PASSWORD` = choose a password for your team
6. Click "Deploy"

### 5. Add Custom Domain (Optional)

1. In Vercel, go to your project → Settings → Domains
2. Add your domain (e.g., `togetherkc.com`)
3. Follow the DNS instructions Vercel provides

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your values
# Then run:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Password protection
- ✅ View all Notion pages
- ✅ Edit text blocks (saves back to Notion)
- ✅ Search pages
- ✅ Mobile responsive
- ✅ Supports headings, lists, to-dos, callouts, quotes, images, etc.

## Supported Block Types

- Paragraphs
- Headings (H1, H2, H3)
- Bulleted lists
- Numbered lists
- To-do checkboxes
- Quotes
- Callouts
- Code blocks
- Dividers
- Images
- Bookmarks
- Child pages
- Databases (as links)
- Toggle blocks
- Columns

## Troubleshooting

**"Page not found" error:**
- Make sure the integration is connected to the page (step 2)
- Check that the page ID is correct

**"Failed to save changes":**
- The integration needs edit permissions (it has them by default)
- Some block types aren't editable (images, embeds)

**Changes not showing:**
- The site fetches fresh data on each page load
- Hard refresh (Cmd+Shift+R) if needed

## Cost

- **Notion API:** Free
- **Vercel Hosting:** Free (hobby tier)
- **Custom Domain:** ~$10-15/year (optional)

**Total: $0** (or ~$12/year with custom domain)
