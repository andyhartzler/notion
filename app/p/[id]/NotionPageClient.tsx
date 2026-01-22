'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Lazy load NotionRenderer and Collection together to ensure proper loading
const NotionPage = dynamic(
  () => import('./NotionPage'),
  {
    ssr: false,
    loading: () => <div style={{padding: '2rem', textAlign: 'center'}}>Loading content...</div>
  }
)

export default function NotionPageClient({ recordMap }: { recordMap: any }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#002855',
        color: 'white',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>
          Together KC
        </Link>
        <button onClick={handleLogout} style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '0.4rem 0.8rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </header>

      <NotionPage recordMap={recordMap} />
    </div>
  )
}
