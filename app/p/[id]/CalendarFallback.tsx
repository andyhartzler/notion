'use client'

import { useMemo } from 'react'
import Link from 'next/link'

interface CalendarFallbackProps {
  recordMap: any
}

export default function CalendarFallback({ recordMap }: CalendarFallbackProps) {
  const { items, collectionName, schema } = useMemo(() => {
    const collection = Object.values(recordMap.collection || {})[0] as any
    const collectionId = collection?.value?.id
    const name = collection?.value?.name?.[0]?.[0] || 'Database'
    const schemaData = collection?.value?.schema || {}

    // Get items from collection_query
    const queryData = recordMap.collection_query?.[collectionId]
    const viewData = queryData ? Object.values(queryData)[0] as any : null
    const blockIds = viewData?.collection_group_results?.blockIds || []

    // Get item data from blocks
    const itemList = blockIds.map((id: string) => {
      const block = recordMap.block?.[id]?.value
      if (!block) return null

      const properties = block.properties || {}

      // Extract title
      const title = properties.title?.[0]?.[0] || 'Untitled'

      // Find date property (look for 'date' type in schema)
      let date: string | null = null
      for (const [key, schemaProp] of Object.entries(schemaData) as any) {
        if (schemaProp.type === 'date' && properties[key]) {
          const dateData = properties[key]?.[0]?.[1]?.[0]?.[1]
          if (dateData?.start_date) {
            date = dateData.start_date
          }
        }
      }

      // Find status/select properties for color coding
      let status: string | null = null
      let platform: string | null = null
      for (const [key, schemaProp] of Object.entries(schemaData) as any) {
        if (schemaProp.type === 'select' || schemaProp.type === 'multi_select') {
          const value = properties[key]?.[0]?.[0]
          if (schemaProp.name?.toLowerCase().includes('status')) {
            status = value
          }
          if (schemaProp.name?.toLowerCase().includes('platform')) {
            platform = value
          }
        }
      }

      return {
        id,
        title,
        date,
        status,
        platform,
      }
    }).filter(Boolean)

    return { items: itemList, collectionName: name, schema: schemaData }
  }, [recordMap])

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, typeof items> = {}
    items.forEach((item: any) => {
      if (item.date) {
        if (!grouped[item.date]) {
          grouped[item.date] = []
        }
        grouped[item.date].push(item)
      }
    })
    return grouped
  }, [items])

  // Generate calendar grid for current month
  const calendarData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()

    const days: Array<{ date: string; dayNum: number; isCurrentMonth: boolean }> = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: dateStr, dayNum: d, isCurrentMonth: false })
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: dateStr, dayNum: d, isCurrentMonth: true })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: dateStr, dayNum: d, isCurrentMonth: false })
    }

    return { days, monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
  }, [])

  const getPlatformColor = (platform: string | null) => {
    if (!platform) return '#e0e0e0'
    const p = platform.toLowerCase()
    if (p.includes('facebook')) return '#1877F2'
    if (p.includes('instagram')) return '#E4405F'
    if (p.includes('twitter') || p.includes('x/')) return '#1DA1F2'
    if (p.includes('tiktok')) return '#000000'
    if (p.includes('youtube')) return '#FF0000'
    return '#6b7280'
  }

  return (
    <div style={{ padding: '1rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{collectionName}</h1>

      <div style={{ marginBottom: '1rem', color: '#666' }}>
        {calendarData.monthName} - {items.length} items
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: '0.5rem',
            textAlign: 'center',
            fontWeight: 600,
            background: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarData.days.map((day, idx) => {
          const dayItems = itemsByDate[day.date] || []
          return (
            <div key={idx} style={{
              minHeight: '100px',
              padding: '0.25rem',
              borderRight: (idx + 1) % 7 !== 0 ? '1px solid #e0e0e0' : 'none',
              borderBottom: idx < 35 ? '1px solid #e0e0e0' : 'none',
              background: day.isCurrentMonth ? 'white' : '#fafafa',
              opacity: day.isCurrentMonth ? 1 : 0.5
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.25rem'
              }}>
                {day.dayNum}
              </div>
              {dayItems.slice(0, 3).map((item: any) => (
                <Link
                  key={item.id}
                  href={`/p/${item.id}`}
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    padding: '2px 4px',
                    marginBottom: '2px',
                    background: getPlatformColor(item.platform),
                    color: 'white',
                    borderRadius: '3px',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.title}
                </Link>
              ))}
              {dayItems.length > 3 && (
                <div style={{ fontSize: '0.65rem', color: '#666' }}>
                  +{dayItems.length - 3} more
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* List view of all items */}
      <h2 style={{ marginTop: '2rem', fontSize: '1.25rem' }}>All Items</h2>
      <div style={{ marginTop: '1rem' }}>
        {items.map((item: any) => (
          <Link
            key={item.id}
            href={`/p/${item.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              borderBottom: '1px solid #e0e0e0',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <span style={{
              width: '4px',
              height: '24px',
              background: getPlatformColor(item.platform),
              borderRadius: '2px'
            }} />
            <span style={{ flex: 1 }}>{item.title}</span>
            {item.date && (
              <span style={{ color: '#666', fontSize: '0.875rem' }}>
                {new Date(item.date + 'T00:00:00').toLocaleDateString()}
              </span>
            )}
            {item.platform && (
              <span style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                background: '#f0f0f0',
                borderRadius: '4px'
              }}>
                {item.platform}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
