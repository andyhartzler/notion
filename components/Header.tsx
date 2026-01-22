'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="header">
      <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
        <h1>Together KC</h1>
      </Link>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/search">Search</Link>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  )
}
