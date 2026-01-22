'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface PageItem {
  id: string
  title: string
  icon?: string
  children?: PageItem[]
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [pages, setPages] = useState<PageItem[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Auto-expand all on load
  useEffect(() => {
    if (pages.length > 0) {
      const allIds = new Set<string>()
      const collectIds = (items: PageItem[]) => {
        for (const item of items) {
          if (item.children && item.children.length > 0) {
            allIds.add(item.id)
            collectIds(item.children)
          }
        }
      }
      collectIds(pages)
      setExpandedIds(allIds)
    }
  }, [pages])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pages')
      .then(res => res.json())
      .then(data => {
        setPages(data.pages || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const currentPageId = pathname.split('/p/')[1]?.replace(/-/g, '')

  const renderPageItem = (page: PageItem, depth: number = 0) => {
    const isActive = page.id.replace(/-/g, '') === currentPageId
    const hasChildren = page.children && page.children.length > 0
    const isExpanded = expandedIds.has(page.id)

    return (
      <div key={page.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            paddingLeft: `${12 + depth * 16}px`,
            borderRadius: '4px',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.81)',
            transition: 'background 0.1s'
          }}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.background = 'transparent'
          }}
        >
          {hasChildren && (
            <span
              onClick={(e) => { e.stopPropagation(); toggleExpand(page.id) }}
              style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '2px',
                color: 'rgba(255,255,255,0.4)',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.1s'
              }}
            >
              ›
            </span>
          )}
          {!hasChildren && <span style={{ width: '22px' }} />}

          <span style={{ marginRight: '6px', fontSize: '16px', display: 'inline-flex', alignItems: 'center' }}>
            {page.icon ? (
              page.icon.startsWith('http') || page.icon.startsWith('/') ? (
                <img src={page.icon} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              ) : (
                page.icon
              )
            ) : '📄'}
          </span>

          <Link
            href={`/p/${page.id}`}
            style={{
              flex: 1,
              color: 'inherit',
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {page.title}
          </Link>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {page.children!.map(child => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isOpen ? '240px' : '0px',
        background: '#202020',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Link href="/" style={{
            color: 'rgba(255,255,255,0.81)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>🏛️</span>
            Together KC
          </Link>
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            ‹
          </button>
        </div>

        {/* Page List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0'
        }}>
          {loading ? (
            <div style={{ padding: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Loading pages...
            </div>
          ) : (
            pages.map(page => renderPageItem(page))
          )}
        </div>
      </div>

      {/* Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          style={{
            position: 'fixed',
            left: '12px',
            top: '12px',
            background: '#202020',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            padding: '6px 10px',
            fontSize: '14px',
            zIndex: 200
          }}
        >
          ☰
        </button>
      )}
    </>
  )
}
