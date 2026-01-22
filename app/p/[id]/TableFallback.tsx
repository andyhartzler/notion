'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

interface TableFallbackProps {
  recordMap: any
}

export default function TableFallback({ recordMap }: TableFallbackProps) {
  const { rows, columns, collectionName, schema, tableProperties } = useMemo(() => {
    const collection = Object.values(recordMap.collection || {})[0] as any
    const collectionId = collection?.value?.id
    const name = collection?.value?.name?.[0]?.[0] || 'Table'
    const schemaData = collection?.value?.schema || {}

    // Get view format for column order and widths
    const collectionView = Object.values(recordMap.collection_view || {})[0] as any
    const tableProps = collectionView?.value?.format?.table_properties || []

    // Build column definitions from table_properties (respects order from Notion)
    const cols = tableProps
      .filter((p: any) => p.visible !== false)
      .map((prop: any) => {
        const propId = prop.property
        const schemaProp = propId === 'title'
          ? { name: 'Name', type: 'title' }
          : schemaData[propId]

        return {
          id: propId,
          name: schemaProp?.name || propId,
          type: schemaProp?.type || 'text',
          width: prop.width || 200,
          options: schemaProp?.options || []
        }
      })

    // Get rows from collection_query
    const queryData = recordMap.collection_query?.[collectionId]
    const viewData = queryData ? Object.values(queryData)[0] as any : null
    const blockIds = viewData?.collection_group_results?.blockIds || []

    const rowData = blockIds.map((id: string) => {
      const block = recordMap.block?.[id]?.value
      if (!block) return null

      const properties = block.properties || {}
      const rowCells: Record<string, any> = { _id: id }

      for (const col of cols) {
        if (col.id === 'title') {
          rowCells[col.id] = {
            value: properties.title?.[0]?.[0] || 'Untitled',
            type: 'title'
          }
        } else {
          const propData = properties[col.id]
          rowCells[col.id] = parsePropertyValue(propData, col.type, recordMap)
        }
      }

      return rowCells
    }).filter(Boolean)

    return {
      rows: rowData,
      columns: cols,
      collectionName: name,
      schema: schemaData,
      tableProperties: tableProps
    }
  }, [recordMap])

  // Parse different property types
  function parsePropertyValue(data: any, type: string, recordMap: any): any {
    if (!data) return { value: '', type }

    switch (type) {
      case 'title':
      case 'text':
      case 'rich_text':
        return { value: data?.[0]?.[0] || '', type }

      case 'number':
        return { value: data?.[0]?.[0] || '', type }

      case 'select':
      case 'status':
        return {
          value: data?.[0]?.[0] || '',
          type,
          color: null // Could extract from schema options
        }

      case 'multi_select':
        const values = data?.[0]?.[0]?.split(',').map((v: string) => v.trim()) || []
        return { value: values, type }

      case 'date':
        const dateData = data?.[0]?.[1]?.[0]?.[1]
        if (dateData?.start_date) {
          return {
            value: dateData.start_date,
            endDate: dateData.end_date,
            type
          }
        }
        return { value: '', type }

      case 'checkbox':
        return { value: data?.[0]?.[0] === 'Yes', type }

      case 'url':
        return { value: data?.[0]?.[0] || '', type }

      case 'email':
        return { value: data?.[0]?.[0] || '', type }

      case 'phone_number':
        return { value: data?.[0]?.[0] || '', type }

      case 'relation':
        // Relations are stored as arrays of page IDs
        const relationIds: string[] = []
        if (data && Array.isArray(data)) {
          for (const item of data) {
            if (Array.isArray(item) && item[1]) {
              for (const ref of item[1]) {
                if (ref[0] === 'p' && ref[1]) {
                  relationIds.push(ref[1])
                }
              }
            }
          }
        }
        // Get page titles for relations
        const relationPages = relationIds.map(id => {
          const block = recordMap.block?.[id]?.value
          return {
            id,
            title: block?.properties?.title?.[0]?.[0] || 'Untitled'
          }
        })
        return { value: relationPages, type }

      case 'person':
        const personIds: string[] = []
        if (data && Array.isArray(data)) {
          for (const item of data) {
            if (Array.isArray(item) && item[1]) {
              for (const ref of item[1]) {
                if (ref[0] === 'u' && ref[1]) {
                  personIds.push(ref[1])
                }
              }
            }
          }
        }
        const persons = personIds.map(id => {
          const user = recordMap.notion_user?.[id]?.value
          return {
            id,
            name: user?.name || 'Unknown'
          }
        })
        return { value: persons, type }

      default:
        return { value: data?.[0]?.[0] || '', type }
    }
  }

  // Render cell content based on type
  const renderCell = (cell: any) => {
    if (!cell) return '-'

    switch (cell.type) {
      case 'title':
        return cell.value

      case 'select':
      case 'status':
        if (!cell.value) return '-'
        return (
          <span style={{
            padding: '2px 8px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.1)',
            fontSize: '12px'
          }}>
            {cell.value}
          </span>
        )

      case 'multi_select':
        if (!cell.value?.length) return '-'
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {cell.value.map((v: string, i: number) => (
              <span key={i} style={{
                padding: '2px 6px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.1)',
                fontSize: '12px'
              }}>
                {v}
              </span>
            ))}
          </div>
        )

      case 'date':
        if (!cell.value) return '-'
        const start = new Date(cell.value + 'T00:00:00').toLocaleDateString()
        if (cell.endDate) {
          const end = new Date(cell.endDate + 'T00:00:00').toLocaleDateString()
          return `${start} → ${end}`
        }
        return start

      case 'checkbox':
        return cell.value ? '☑' : '☐'

      case 'url':
        if (!cell.value) return '-'
        return (
          <a href={cell.value} target="_blank" rel="noopener" style={{
            color: '#2eaadc',
            textDecoration: 'underline'
          }}>
            {cell.value.replace(/^https?:\/\//, '').slice(0, 30)}...
          </a>
        )

      case 'relation':
        if (!cell.value?.length) return '-'
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {cell.value.map((page: any) => (
              <Link
                key={page.id}
                href={`/p/${page.id}`}
                style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: 'rgba(255,255,255,0.1)',
                  fontSize: '12px',
                  color: 'inherit',
                  textDecoration: 'none'
                }}
              >
                {page.title}
              </Link>
            ))}
          </div>
        )

      case 'person':
        if (!cell.value?.length) return '-'
        return cell.value.map((p: any) => p.name).join(', ')

      default:
        return cell.value || '-'
    }
  }

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
        <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          {rows.length} items
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr>
              {columns.map((col: any) => (
                <th
                  key={col.id}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    maxWidth: col.width,
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.6)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: '#202020',
                    position: 'sticky',
                    top: 0
                  }}
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIdx: number) => (
              <tr
                key={row._id}
                style={{
                  background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                }}
              >
                {columns.map((col: any, colIdx: number) => (
                  <td
                    key={col.id}
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      maxWidth: col.width,
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      verticalAlign: 'top',
                      overflow: 'hidden'
                    }}
                  >
                    {colIdx === 0 ? (
                      <Link
                        href={`/p/${row._id}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        {renderCell(row[col.id])}
                      </Link>
                    ) : (
                      renderCell(row[col.id])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
