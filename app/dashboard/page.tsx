import Link from 'next/link'

export default function Dashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      background: '#fafafa'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Together KC</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <Link
          href="/embed/2efc4b28b1ea81ada46bc5258a27893d"
          style={{
            padding: '1rem 2rem',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          Campaign Reference Wiki
        </Link>
        <Link
          href="/embed/2efc4b28b1ea8174b74fd0a4a148c5d0"
          style={{
            padding: '1rem 2rem',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          Together KC Command Center
        </Link>
      </div>
    </div>
  )
}
