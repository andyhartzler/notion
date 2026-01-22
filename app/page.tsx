import { redirect } from 'next/navigation'

export default function HomePage() {
  const rootPageId = process.env.NOTION_ROOT_PAGE_ID

  if (!rootPageId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', color: '#002855' }}>Setup Required</h1>
        <p style={{ color: '#6b6b6b', maxWidth: '400px' }}>
          Please set <code style={{ background: '#f7f6f3', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>NOTION_ROOT_PAGE_ID</code> in your environment variables.
        </p>
        <p style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>
          See README.md for setup instructions.
        </p>
      </div>
    )
  }

  redirect(`/page/${rootPageId}`)
}
