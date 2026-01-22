'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface TimelineFallbackProps {
  recordMap: any
}

export default function TimelineFallback({ recordMap }: TimelineFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  const { items, collectionName, schema, dateProperty } = useMemo(() => {
    const collection = Object.values(recordMap.collection || {})[0] as any
    const collectionId = collection?.value?.id
    const name = collection?.value?.name?.[0]?.[0] || 'Timeline'
    const schemaData = collection?.value?.schema || {}

    // Find the date property used for timeline
    let dateProp: string | null = null
    for (const [key, prop] of Object.entries(schemaData) as any) {
      if (prop.type === 'date') {
        dateProp = key
        break
      }
    }

    const queryData = recordMap.collection_query?.[collectionId]
    const viewData = queryData ? Object.values(queryData)[0] as any : null
    const blockIds = viewData?.collection_group_results?.blockIds || []

    const itemList = blockIds.map((id: string) => {
      const block = recordMap.block?.[id]?.value
      if (!block) return null

      const properties = block.properties || {}
      const title = properties.title?.[0]?.[0] || 'Untitled'

      let startDate: string | null = null
      let endDate: string | null = null

      // Get dates from all date properties
      for (const [key, prop] of Object.entries(schemaData) as any) {
        if (prop.type === 'date' && properties[key]) {
          const dateData = properties[key]?.[0]?.[1]?.[0]?.[1]
          if (dateData?.start_date) {
            if (!startDate) startDate = dateData.start_date
            if (dateData.end_date) endDate = dateData.end_date
          }
        }
      }

      // Get status/phase for coloring
      let status: string | null = null
      let color: string | null = null
      for (const [key, prop] of Object.entries(schemaData) as any) {
        if ((prop.type === 'select' || prop.type === 'status') && properties[key]) {
          status = properties[key]?.[0]?.[0]
          const option = prop.options?.find((o: any) => o.value === status)
          if (option?.color) color = option.color
        }
      }

      return { id, title, startDate, endDate, status, color }
    }).filter((item: any) => item && item.startDate)

    return { items: itemList, collectionName: name, schema: schemaData, dateProperty: dateProp }
  }, [recordMap])

  // Calculate timeline range
  const { minDate, maxDate, totalDays, months } = useMemo(() => {
    if (items.length === 0) {
      const now = new Date()
      return {
        minDate: now,
        maxDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        totalDays: 90,
        months: []
      }
    }

    let min = new Date(items[0].startDate)
    let max = new Date(items[0].endDate || items[0].startDate)

    for (const item of items) {
      const start = new Date(item.startDate)
      const end = new Date(item.endDate || item.startDate)
      if (start < min) min = start
      if (end > max) max = end
    }

    // Add padding
    min = new Date(min.getTime() - 7 * 24 * 60 * 60 * 1000)
    max = new Date(max.getTime() + 14 * 24 * 60 * 60 * 1000)

    const days = Math.ceil((max.getTime() - min.getTime()) / (24 * 60 * 60 * 1000))

    // Generate months for header
    const monthList: Array<{ name: string; startDay: number; days: number }> = []
    let current = new Date(min)
    while (current <= max) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      const startDay = Math.max(0, Math.ceil((monthStart.getTime() - min.getTime()) / (24 * 60 * 60 * 1000)))
      const endDay = Math.min(days, Math.ceil((monthEnd.getTime() - min.getTime()) / (24 * 60 * 60 * 1000)))

      monthList.push({
        name: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        startDay,
        days: endDay - startDay
      })

      current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
    }

    return { minDate: min, maxDate: max, totalDays: days, months: monthList }
  }, [items])

  const getItemColor = (item: any) => {
    const colors: Record<string, string> = {
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
    return colors[item.color] || colors.blue
  }

  const dayWidth = 40 // pixels per day

  return (
    <div style={{
      background: '#191919',
      color: 'rgba(255,255,255,0.81)',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ padding: '12px 24px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 700, margin: 0 }}>
          {collectionName}
        </h1>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        style={{
          overflowX: 'auto',
          padding: '0 24px 24px'
        }}
      >
        <div style={{ minWidth: totalDays * dayWidth + 200 }}>
          {/* Month Headers */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginLeft: '200px'
          }}>
            {months.map((month, idx) => (
              <div
                key={idx}
                style={{
                  width: month.days * dayWidth,
                  padding: '8px 0',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  borderLeft: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {month.name}
              </div>
            ))}
          </div>

          {/* Timeline Items */}
          <div style={{ position: 'relative' }}>
            {items.map((item: any, idx: number) => {
              const startOffset = Math.max(0, Math.ceil((new Date(item.startDate).getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000)))
              const endOffset = item.endDate
                ? Math.ceil((new Date(item.endDate).getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000))
                : startOffset + 1
              const duration = Math.max(1, endOffset - startOffset)

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '36px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {/* Item Title */}
                  <div style={{
                    width: '200px',
                    flexShrink: 0,
                    padding: '0 12px',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <Link
                      href={`/p/${item.id}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {item.title}
                    </Link>
                  </div>

                  {/* Timeline Bar Area */}
                  <div style={{
                    flex: 1,
                    position: 'relative',
                    height: '100%'
                  }}>
                    <Link
                      href={`/p/${item.id}`}
                      style={{
                        position: 'absolute',
                        left: startOffset * dayWidth,
                        width: duration * dayWidth - 4,
                        height: '24px',
                        top: '6px',
                        background: getItemColor(item),
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        fontSize: '11px',
                        color: 'white',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {duration > 2 ? item.title : ''}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
