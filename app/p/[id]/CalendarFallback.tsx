'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

interface CalendarFallbackProps {
  recordMap: any
}

export default function CalendarFallback({ recordMap }: CalendarFallbackProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { items, collectionName, schema } = useMemo(() => {
    const collection = Object.values(recordMap.collection || {})[0] as any
    const collectionId = collection?.value?.id
    const name = collection?.value?.name?.[0]?.[0] || 'Database'
    const schemaData = collection?.value?.schema || {}

    const queryData = recordMap.collection_query?.[collectionId]
    const viewData = queryData ? Object.values(queryData)[0] as any : null
    const blockIds = viewData?.collection_group_results?.blockIds || []

    const itemList = blockIds.map((id: string) => {
      const block = recordMap.block?.[id]?.value
      if (!block) return null

      const properties = block.properties || {}
      const title = properties.title?.[0]?.[0] || 'Untitled'

      let date: string | null = null
      for (const [key, schemaProp] of Object.entries(schemaData) as any) {
        if (schemaProp.type === 'date' && properties[key]) {
          const dateData = properties[key]?.[0]?.[1]?.[0]?.[1]
          if (dateData?.start_date) {
            date = dateData.start_date
          }
        }
      }

      let status: string | null = null
      let platform: string | null = null
      let color: string | null = null
      for (const [key, schemaProp] of Object.entries(schemaData) as any) {
        if (schemaProp.type === 'select' || schemaProp.type === 'multi_select') {
          const value = properties[key]?.[0]?.[0]
          if (schemaProp.name?.toLowerCase().includes('status')) {
            status = value
            // Get color from schema options
            const option = schemaProp.options?.find((o: any) => o.value === value)
            if (option?.color) color = option.color
          }
          if (schemaProp.name?.toLowerCase().includes('platform')) {
            platform = value
          }
        }
      }

      return { id, title, date, status, platform, color }
    }).filter(Boolean)

    return { items: itemList, collectionName: name, schema: schemaData }
  }, [recordMap])

  const itemsByDate = useMemo(() => {
    const grouped: Record<string, typeof items> = {}
    items.forEach((item: any) => {
      if (item.date) {
        if (!grouped[item.date]) grouped[item.date] = []
        grouped[item.date].push(item)
      }
    })
    return grouped
  }, [items])

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()

    const days: Array<{ date: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }> = []
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const prevMonth = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: dateStr, dayNum: d, isCurrentMonth: true, isToday: dateStr === todayStr })
    }

    const remaining = 42 - days.length
    const nextMonth = month === 11 ? 1 : month + 2
    const nextYear = month === 11 ? year + 1 : year
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date: dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr })
    }

    return { days, monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
  }, [currentDate])

  const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  // Notion-style colors
  const getItemColor = (item: any) => {
    const notionColors: Record<string, string> = {
      default: '#505558',
      gray: '#505558',
      brown: '#64473a',
      orange: '#d9730d',
      yellow: '#dfab01',
      green: '#0f7b6c',
      blue: '#0b6e99',
      purple: '#6940a5',
      pink: '#ad1a72',
      red: '#e03e3e',
    }
    if (item.color && notionColors[item.color]) return notionColors[item.color]

    // Fallback based on platform
    const p = (item.platform || '').toLowerCase()
    if (p.includes('facebook')) return '#0b6e99'
    if (p.includes('instagram')) return '#ad1a72'
    if (p.includes('twitter') || p.includes('x/')) return '#0b6e99'
    if (p.includes('tiktok')) return '#505558'
    return '#505558'
  }

  return (
    <div style={{
      background: '#191919',
      color: 'rgba(255,255,255,0.81)',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 24px',
      }}>
        <h1 style={{
          fontSize: '40px',
          fontWeight: 700,
          margin: 0,
          padding: '3px 2px'
        }}>
          {collectionName}
        </h1>
      </div>

      {/* Calendar Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={goToToday} style={{
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            color: 'rgba(255,255,255,0.81)',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Today
          </button>
          <button onClick={goToPrevMonth} style={{
            padding: '4px 8px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '18px'
          }}>
            ‹
          </button>
          <button onClick={goToNextMonth} style={{
            padding: '4px 8px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '18px'
          }}>
            ›
          </button>
          <span style={{ marginLeft: '8px', fontWeight: 500 }}>
            {calendarData.monthName}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              {day}
            </div>
          ))}

          {/* Calendar cells */}
          {calendarData.days.map((day, idx) => {
            const dayItems = itemsByDate[day.date] || []
            return (
              <div key={idx} style={{
                minHeight: '120px',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: day.isCurrentMonth ? 'transparent' : 'rgba(255,255,255,0.02)',
                opacity: day.isCurrentMonth ? 1 : 0.4
              }}>
                <div style={{
                  padding: '4px 8px',
                  fontSize: '14px',
                  color: day.isToday ? '#2eaadc' : 'rgba(255,255,255,0.5)'
                }}>
                  {day.isToday ? (
                    <span style={{
                      background: '#2eaadc',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {day.dayNum}
                    </span>
                  ) : day.dayNum}
                </div>
                <div style={{ padding: '0 4px 4px' }}>
                  {dayItems.slice(0, 4).map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/p/${item.id}`}
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        padding: '2px 6px',
                        marginBottom: '2px',
                        background: getItemColor(item),
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
                  {dayItems.length > 4 && (
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.5)',
                      padding: '2px 6px'
                    }}>
                      +{dayItems.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
