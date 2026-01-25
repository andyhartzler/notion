import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pageId = params.id

  // Embed with banner hidden by clipping the top
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; overflow: hidden; }
    .iframe-container {
      width: 100%;
      height: calc(100% + 50px);
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
