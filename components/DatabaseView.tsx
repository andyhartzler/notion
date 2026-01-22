'use client'

import Link from 'next/link'

interface DatabaseViewProps {
  data: {
    database: any
    results: any[]
  }
}

function getDatabasePropertyValue(property: any): string {
  if (!property) return ''

  switch (property.type) {
    case 'title':
      return property.title?.map((t: any) => t.plain_text).join('') || ''
    case 'rich_text':
      return property.rich_text?.map((t: any) => t.plain_text).join('') || ''
    case 'number':
      return property.number?.toString() || ''
    case 'select':
      return property.select?.name || ''
    case 'multi_select':
      return property.multi_select?.map((s: any) => s.name).join(', ') || ''
    case 'date':
      return property.date?.start || ''
    case 'checkbox':
      return property.checkbox ? '✓' : ''
    case 'url':
      return property.url || ''
    case 'email':
      return property.email || ''
    case 'phone_number':
      return property.phone_number || ''
    case 'status':
      return property.status?.name || ''
    case 'people':
      return property.people?.map((p: any) => p.name).join(', ') || ''
    case 'relation':
      return `${property.relation?.length || 0} linked`
    default:
      return ''
  }
}

export default function DatabaseView({ data }: DatabaseViewProps) {
  const { database, results } = data

  // Get property schema from database
  const properties = database.properties || {}
  const propertyNames = Object.keys(properties)

  // Find the title property
  const titlePropertyName = propertyNames.find(
    (name) => properties[name].type === 'title'
  ) || propertyNames[0]

  // Get other visible properties (limit to avoid overflow)
  const visibleProperties = propertyNames
    .filter((name) => name !== titlePropertyName)
    .slice(0, 5)

  if (results.length === 0) {
    return (
      <div style={{ color: '#6b6b6b', padding: '2rem', textAlign: 'center' }}>
        No items in this database
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="database-table">
        <thead>
          <tr>
            <th>{titlePropertyName}</th>
            {visibleProperties.map((name) => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row: any) => {
            const titleValue = row.properties[titlePropertyName]
            const title = getDatabasePropertyValue(titleValue) || 'Untitled'

            return (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/page/${row.id}`}
                    style={{ color: '#0077C8', fontWeight: 500 }}
                  >
                    {row.icon?.emoji && (
                      <span style={{ marginRight: '0.5rem' }}>{row.icon.emoji}</span>
                    )}
                    {title}
                  </Link>
                </td>
                {visibleProperties.map((name) => (
                  <td key={name}>
                    <PropertyCell property={row.properties[name]} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PropertyCell({ property }: { property: any }) {
  if (!property) return null

  const value = getDatabasePropertyValue(property)

  // Special rendering for certain types
  if (property.type === 'select' && property.select) {
    return (
      <span
        style={{
          background: getSelectColor(property.select.color),
          padding: '0.125rem 0.5rem',
          borderRadius: '3px',
          fontSize: '0.875rem',
        }}
      >
        {property.select.name}
      </span>
    )
  }

  if (property.type === 'multi_select' && property.multi_select) {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {property.multi_select.map((item: any, i: number) => (
          <span
            key={i}
            style={{
              background: getSelectColor(item.color),
              padding: '0.125rem 0.5rem',
              borderRadius: '3px',
              fontSize: '0.875rem',
            }}
          >
            {item.name}
          </span>
        ))}
      </div>
    )
  }

  if (property.type === 'status' && property.status) {
    return (
      <span
        style={{
          background: getSelectColor(property.status.color),
          padding: '0.125rem 0.5rem',
          borderRadius: '3px',
          fontSize: '0.875rem',
        }}
      >
        {property.status.name}
      </span>
    )
  }

  if (property.type === 'checkbox') {
    return <span>{property.checkbox ? '✓' : ''}</span>
  }

  if (property.type === 'url' && property.url) {
    return (
      <a href={property.url} target="_blank" rel="noopener noreferrer">
        {property.url.length > 30 ? property.url.substring(0, 30) + '...' : property.url}
      </a>
    )
  }

  if (property.type === 'date' && property.date) {
    const start = property.date.start
    const end = property.date.end
    if (end) {
      return <span>{start} → {end}</span>
    }
    return <span>{start}</span>
  }

  return <span>{value}</span>
}

function getSelectColor(color: string): string {
  const colors: Record<string, string> = {
    default: '#e0e0e0',
    gray: '#e0e0e0',
    brown: '#eee0da',
    orange: '#fadec9',
    yellow: '#fdecc8',
    green: '#dbeddb',
    blue: '#d3e5ef',
    purple: '#e8deee',
    pink: '#f5e0e9',
    red: '#ffe2dd',
  }
  return colors[color] || colors.default
}
