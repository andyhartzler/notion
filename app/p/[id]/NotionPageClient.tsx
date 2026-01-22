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
    <div style={{ background: '#191919', minHeight: '100vh' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#191919',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.81)',
        padding: '0 96px',
        height: '45px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{
          color: 'rgba(255,255,255,0.81)',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '14px'
        }}>
          Together KC
        </Link>
        <button onClick={handleLogout} style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.6)',
          padding: '4px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Logout
        </button>
      </header>

      <NotionPage recordMap={recordMap} />
    </div>
  )
}
