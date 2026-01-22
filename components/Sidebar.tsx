'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  id: string
  title: string
  type: 'page' | 'database'
  icon: string
}

export default function Sidebar({
  items,
  currentPageId,
  rootPageId,
}: {
  items: NavItem[]
  currentPageId: string
  rootPageId: string
}) {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem' }}>
        <Link
          href={`/p/${rootPageId}`}
          className={`sidebar-item ${currentPageId === rootPageId ? 'active' : ''}`}
          style={{ fontWeight: 600 }}
        >
          🏠 Home
        </Link>
      </div>

      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem' }}>
        <div
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            color: '#6b6b6b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Pages
        </div>

        {items.map((item) => (
          <Link
            key={item.id}
            href={`/p/${item.id}`}
            className={`sidebar-item ${currentPageId === item.id ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </span>
          </Link>
        ))}

        {items.length === 0 && (
          <div style={{ padding: '0.5rem 1rem', color: '#6b6b6b', fontSize: '0.875rem' }}>
            No pages found
          </div>
        )}
      </div>
    </aside>
  )
}
