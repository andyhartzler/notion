'use client'

import { useState } from 'react'
import { NotionBlockList } from '@/components/NotionBlock'
import EditableBlock from '@/components/EditableBlock'

interface Block {
  id: string
  type: string
  has_children: boolean
  children?: Block[]
  [key: string]: any
}

export default function PageContent({
  blocks: initialBlocks,
  pageId,
}: {
  blocks: Block[]
  pageId: string
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [editMode, setEditMode] = useState(false)

  const handleBlockUpdate = async (blockId: string, content: any) => {
    try {
      const res = await fetch(`/api/notion/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })

      if (!res.ok) {
        throw new Error('Failed to update block')
      }

      // Update local state
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId ? { ...block, ...content } : block
        )
      )
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to save changes')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: '0.5rem 1rem',
            background: editMode ? '#0077C8' : '#f7f6f3',
            color: editMode ? 'white' : '#37352f',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {editMode ? '✓ Editing' : '✎ Edit'}
        </button>
      </div>

      {editMode ? (
        <div>
          {blocks.map((block) => (
            <EditableBlock
              key={block.id}
              block={block}
              onUpdate={handleBlockUpdate}
            />
          ))}
        </div>
      ) : (
        <NotionBlockList blocks={blocks} />
      )}
    </div>
  )
}
