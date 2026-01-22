import Link from 'next/link'
import Header from '@/components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
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
      </main>
    </>
  )
}
