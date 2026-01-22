'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const NotionRenderer = dynamic(
  () => import('react-notion-x').then((m) => m.NotionRenderer),
  { ssr: false }
)

const Collection = dynamic(
  () => import('react-notion-x/build/third-party/collection').then((m) => m.Collection),
  { ssr: false }
)

const Code = dynamic(
  () => import('react-notion-x/build/third-party/code').then((m) => m.Code),
  { ssr: false }
)

const Equation = dynamic(
  () => import('react-notion-x/build/third-party/equation').then((m) => m.Equation),
  { ssr: false }
)

interface NotionEmbedProps {
  recordMap: any
  pageId: string
}

export default function NotionEmbed({ recordMap, pageId }: NotionEmbedProps) {
  useEffect(() => {
    // Send height to parent for responsive iframe
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'resize', height }, '*')
    }

    sendHeight()
    window.addEventListener('resize', sendHeight)

    // Observe DOM changes for dynamic content
    const observer = new MutationObserver(sendHeight)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', sendHeight)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="notion-embed-container">
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #191919;
        }

        .notion-embed-container {
          min-height: 100vh;
        }

        /* Dark mode */
        .notion {
          --fg-color: rgba(255, 255, 255, 0.81);
          --fg-color-0: rgba(255, 255, 255, 0.81);
          --fg-color-1: rgba(255, 255, 255, 0.81);
          --fg-color-2: rgba(255, 255, 255, 0.6);
          --fg-color-3: rgba(255, 255, 255, 0.5);
          --fg-color-4: rgba(255, 255, 255, 0.4);
          --fg-color-5: rgba(255, 255, 255, 0.3);
          --fg-color-6: rgba(255, 255, 255, 0.2);
          --bg-color: #191919;
          --bg-color-0: #191919;
          --bg-color-1: #202020;
          --bg-color-2: #2f2f2f;
        }

        .notion-page {
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        .notion-page-content {
          padding: 0 24px !important;
          max-width: 100% !important;
        }

        .notion-collection {
          width: 100% !important;
          max-width: 100% !important;
        }

        .notion-table {
          width: 100% !important;
        }

        .notion-calendar {
          width: 100% !important;
        }

        .notion-board {
          width: 100% !important;
        }

        .notion-gallery {
          width: 100% !important;
        }

        .notion-list {
          width: 100% !important;
        }

        .notion-timeline {
          width: 100% !important;
        }

        /* Links open in new tab within iframe */
        a {
          target: _blank;
        }
      `}</style>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        rootPageId={pageId}
        mapPageUrl={(id) => `/embed/${id}`}
        components={{
          Collection,
          Code,
          Equation,
        }}
      />
    </div>
  )
}
