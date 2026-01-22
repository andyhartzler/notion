import '../../globals.css'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'

export const metadata = {
  title: 'Together KC',
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Allow iframe embedding */}
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#191919' }}>
        {children}
      </body>
    </html>
  )
}
