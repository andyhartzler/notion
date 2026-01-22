'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface RichText {
  type: string
  text?: { content: string; link?: { url: string } | null }
  plain_text: string
}

interface Block {
  id: string
  type: string
  has_children: boolean
  children?: Block[]
  [key: string]: any
}

function getPlainText(richText: RichText[]): string {
  if (!richText) return ''
  return richText.map((t) => t.plain_text).join('')
}

function createRichText(text: string): RichText[] {
  return [
    {
      type: 'text',
      text: { content: text },
      plain_text: text,
    },
  ]
}

export default function EditableBlock({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (blockId: string, content: any) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const inputRef = useRef<HTMLDivElement>(null)

  const getBlockText = (): string => {
    const blockData = block[block.type]
    if (!blockData?.rich_text) return ''
    return getPlainText(blockData.rich_text)
  }

  useEffect(() => {
    setContent(getBlockText())
  }, [block])

  const handleBlur = () => {
    setIsEditing(false)
    const originalText = getBlockText()

    if (content !== originalText) {
      const updatePayload: any = {}

      if (block.type === 'paragraph') {
        updatePayload.paragraph = { rich_text: createRichText(content) }
      } else if (block.type === 'heading_1') {
        updatePayload.heading_1 = { rich_text: createRichText(content) }
      } else if (block.type === 'heading_2') {
        updatePayload.heading_2 = { rich_text: createRichText(content) }
      } else if (block.type === 'heading_3') {
        updatePayload.heading_3 = { rich_text: createRichText(content) }
      } else if (block.type === 'bulleted_list_item') {
        updatePayload.bulleted_list_item = { rich_text: createRichText(content) }
      } else if (block.type === 'numbered_list_item') {
        updatePayload.numbered_list_item = { rich_text: createRichText(content) }
      } else if (block.type === 'to_do') {
        updatePayload.to_do = {
          rich_text: createRichText(content),
          checked: block.to_do?.checked || false,
        }
      } else if (block.type === 'quote') {
        updatePayload.quote = { rich_text: createRichText(content) }
      } else if (block.type === 'callout') {
        updatePayload.callout = {
          rich_text: createRichText(content),
          icon: block.callout?.icon,
        }
      } else if (block.type === 'toggle') {
        updatePayload.toggle = { rich_text: createRichText(content) }
      }

      if (Object.keys(updatePayload).length > 0) {
        onUpdate(block.id, updatePayload)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setContent(getBlockText())
      setIsEditing(false)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    onUpdate(block.id, {
      to_do: {
        rich_text: block.to_do?.rich_text || createRichText(content),
        checked,
      },
    })
  }

  // Non-editable blocks
  if (
    block.type === 'child_page' ||
    block.type === 'child_database' ||
    block.type === 'link_to_page'
  ) {
    const pageId = block.type === 'link_to_page' ? block.link_to_page?.page_id : block.id
    const title =
      block.child_page?.title || block.child_database?.title || 'Linked Page'
    const icon = block.type === 'child_database' ? '📊' : '📄'

    return (
      <Link href={`/page/${pageId}`} className="child-page-link">
        <span className="child-page-icon">{icon}</span>
        <span>{title}</span>
      </Link>
    )
  }

  if (block.type === 'divider') {
    return <hr className="notion-divider" />
  }

  if (block.type === 'image') {
    const imageUrl =
      block.image?.type === 'external'
        ? block.image.external?.url
        : block.image?.file?.url
    return imageUrl ? (
      <img src={imageUrl} alt="" className="notion-block notion-image" />
    ) : null
  }

  if (block.type === 'code') {
    return (
      <pre className="notion-block notion-code">
        <code>{getPlainText(block.code?.rich_text)}</code>
      </pre>
    )
  }

  // Editable text blocks
  const editableTypes = [
    'paragraph',
    'heading_1',
    'heading_2',
    'heading_3',
    'bulleted_list_item',
    'numbered_list_item',
    'to_do',
    'quote',
    'callout',
    'toggle',
  ]

  if (!editableTypes.includes(block.type)) {
    return null
  }

  const getClassName = () => {
    const classes = ['editable-block', `notion-${block.type.replace('_', '-')}`]
    if (block.type === 'to_do' && block.to_do?.checked) {
      classes.push('checked')
    }
    return classes.join(' ')
  }

  const renderEditableContent = () => {
    if (block.type === 'to_do') {
      return (
        <div className="notion-to-do">
          <input
            type="checkbox"
            checked={block.to_do?.checked || false}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
          />
          <div
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onInput={(e) => setContent(e.currentTarget.textContent || '')}
            style={{ flex: 1, outline: 'none' }}
          >
            {content}
          </div>
        </div>
      )
    }

    if (block.type === 'callout') {
      return (
        <div className="notion-callout">
          <span className="notion-callout-icon">
            {block.callout?.icon?.emoji || '💡'}
          </span>
          <div
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onInput={(e) => setContent(e.currentTarget.textContent || '')}
            style={{ flex: 1, outline: 'none' }}
          >
            {content}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={(e) => setContent(e.currentTarget.textContent || '')}
        className={getClassName()}
        style={{ outline: 'none' }}
      >
        {content}
      </div>
    )
  }

  return (
    <div className={getClassName()}>
      {renderEditableContent()}
      {block.has_children && block.children && (
        <div style={{ marginLeft: '1.5rem' }}>
          {block.children.map((child) => (
            <EditableBlock key={child.id} block={child} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
