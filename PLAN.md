# Plan: Notion Embed That Actually Works

## The Problem
- Proxying notion.so directly gets rate limited by Cloudflare
- Vercel's IPs are now banned
- embednotion.com works because they have proper infrastructure

## Why embednotion.com Works
1. **Cloudflare Workers** - They likely use Cloudflare Workers, not Vercel
2. Cloudflare won't aggressively rate limit requests from its own edge network to sites it protects
3. Proper CDN caching layer
4. Distributed IPs across Cloudflare's massive network

## Solution: Use Cloudflare Workers

### Option A: Cloudflare Worker Proxy (Recommended)
Deploy a Cloudflare Worker that proxies Notion - same approach but on Cloudflare's network.

**Pros:**
- Cloudflare → Cloudflare = no rate limiting issues
- Free tier: 100,000 requests/day
- Same approach as embednotion.com likely uses

**Implementation:**
1. Create Cloudflare account (free)
2. Create a Worker that proxies notion.so
3. Deploy to workers.dev subdomain or custom domain
4. Point your Vercel app to use the Cloudflare Worker

### Option B: Official Notion API + react-notion-x
Use Notion's official API to fetch page data, render with react-notion-x.

**Pros:**
- Official API = no rate limiting issues
- Full control over rendering
- Used by Super.so, Notion2Site, etc.

**Cons:**
- More complex setup
- Need to handle rendering ourselves
- May not look 100% identical to Notion

## Recommended: Option A (Cloudflare Worker)

### Step 1: Create Cloudflare Worker
```javascript
// worker.js - Simple Notion proxy
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const pageId = url.pathname.slice(1) // Remove leading /

  if (!pageId) {
    return new Response('Page ID required', { status: 400 })
  }

  const notionUrl = `https://www.notion.so/${pageId}`

  const response = await fetch(notionUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0...',
    }
  })

  let html = await response.text()

  // Rewrite URLs to go through this worker
  const workerUrl = url.origin
  html = html.replace(/https:\/\/www\.notion\.so/g, workerUrl)

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      // Forward cookies with SameSite=None
    }
  })
}
```

### Step 2: Deploy to Cloudflare
1. Go to dash.cloudflare.com
2. Workers & Pages → Create Worker
3. Paste the code
4. Deploy

### Step 3: Update Vercel App
Point /embed/[id] to redirect to or proxy from the Cloudflare Worker.

## Next Steps
1. Do you have a Cloudflare account?
2. I can write the complete Cloudflare Worker code
3. We deploy it and test
4. Then connect it to your Vercel app

## Alternative: Just Use Cloudflare for Everything
Instead of Vercel + Cloudflare, just use Cloudflare Pages + Workers for the whole thing. Simpler architecture.
