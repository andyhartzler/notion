import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pageId = params.id

  // Page titles for navigation
  const pages: Record<string, string> = {
    '2efc4b28b1ea81ada46bc5258a27893d': 'Campaign Reference Wiki',
    '2efc4b28b1ea8174b74fd0a4a148c5d0': 'Campaign Command Center',
  }
  const currentTitle = pages[pageId] || 'Notion Page'
  const otherPageId = pageId === '2efc4b28b1ea81ada46bc5258a27893d'
    ? '2efc4b28b1ea8174b74fd0a4a148c5d0'
    : '2efc4b28b1ea81ada46bc5258a27893d'
  const otherTitle = pages[otherPageId] || 'Other Page'

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .navbar {
      height: 45px;
      background: #191919;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      border-bottom: 1px solid #333;
    }
    .nav-link {
      color: #999;
      text-decoration: none;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.15s;
    }
    .nav-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }
    .nav-link.active {
      color: #fff;
      font-weight: 500;
    }
    .iframe-container {
      width: 100%;
      height: calc(100% - 45px + 50px);
      overflow: hidden;
      position: relative;
    }
    iframe {
      width: 100%;
      height: calc(100% + 50px);
      border: none;
      position: absolute;
      top: -50px;
      left: 0;
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <a href="/embed/2efc4b28b1ea8174b74fd0a4a148c5d0" class="nav-link ${pageId === '2efc4b28b1ea8174b74fd0a4a148c5d0' ? 'active' : ''}">Campaign Command Center</a>
    <a href="/embed/2efc4b28b1ea81ada46bc5258a27893d" class="nav-link ${pageId === '2efc4b28b1ea81ada46bc5258a27893d' ? 'active' : ''}">Campaign Reference Wiki</a>
  </nav>
  <div class="iframe-container">
    <iframe src="https://notion-embed.hartzler.workers.dev/${pageId}" allowfullscreen></iframe>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
