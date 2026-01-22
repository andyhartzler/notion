'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

interface SearchResult {
  id: string
  title: string
  icon?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)

    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/notion/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results">
          {loading && <div className="loading">Searching...</div>}

          {!loading && results.length === 0 && query && (
            <p style={{ color: '#6b6b6b', padding: '1rem' }}>
              No results found for "{query}"
            </p>
          )}

          {!loading &&
            results.map((result) => (
              <Link
                key={result.id}
                href={`/page/${result.id}`}
                className="search-result-item"
                style={{ display: 'block' }}
              >
                <span style={{ marginRight: '0.5rem' }}>{result.icon || '📄'}</span>
                {result.title}
              </Link>
            ))}
        </div>
      </main>
    </>
  )
}
