import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#002855' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#6b6b6b', marginBottom: '2rem' }}>
        Page not found
      </p>
      <Link
        href="/"
        style={{
          background: '#0077C8',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        Go Home
      </Link>
    </div>
  )
}
