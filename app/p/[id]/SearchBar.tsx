'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface PageItem {
  id: string
  title: string
  icon?: string | null
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pages, setPages] = useState<PageItem[]>([])
  const [filteredPages, setFilteredPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch pages when opened
  useEffect(() => {
    if (isOpen && pages.length === 0) {
      setLoading(true)
      fetch('/api/pages')
        .then(res => res.json())
        .then(data => {
          // Flatten pages and children
          const allPages: PageItem[] = []
          for (const page of data.pages || []) {
            allPages.push({ id: page.id, title: page.title, icon: page.icon })
            if (page.children) {
              for (const child of page.children) {
                allPages.push({ id: child.id, title: child.title, icon: child.icon })
              }
            }
          }
          setPages(allPages)
          setFilteredPages(allPages)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isOpen, pages.length])

  // Filter pages based on query
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredPages(pages)
    } else {
      const lowerQuery = query.toLowerCase()
      setFilteredPages(pages.filter(p => p.title.toLowerCase().includes(lowerQuery)))
    }
  }, [query, pages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderIcon = (icon: string | null | undefined) => {
    if (!icon) return '📄'
    // If it's a URL (Notion custom icon), show default emoji
    if (icon.startsWith('http') || icon.startsWith('/')) return '📄'
    return icon
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          fontSize: '14px',
          minWidth: '200px'
        }}
      >
        <span>🔍</span>
        <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
        <span style={{
          fontSize: '11px',
          padding: '2px 4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px'
        }}>
          ⌘K
        </span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          maxWidth: '90vw',
          background: '#2f2f2f',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ marginRight: '12px', color: 'rgba(255,255,255,0.5)' }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '16px'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Results */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                padding: '16px',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center'
              }}>
                Loading pages...
              </div>
            ) : filteredPages.length === 0 ? (
              <div style={{
                padding: '16px',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center'
              }}>
                No pages found
              </div>
            ) : (
              filteredPages.map(page => (
                <Link
                  key={page.id}
                  href={`/p/${page.id}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    color: 'rgba(255,255,255,0.81)',
                    textDecoration: 'none',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ marginRight: '10px', fontSize: '18px' }}>
                    {renderIcon(page.icon)}
                  </span>
                  <span>{page.title}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }} />
      )}
    </div>
  )
}
