'use client'

import { useState } from 'react'
import Link from 'next/link'

interface RichText {
  type: string
  text?: { content: string; link?: { url: string } | null }
  annotations?: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href?: string | null
}

interface Block {
  id: string
  type: string
  has_children: boolean
  children?: Block[]
  [key: string]: any
}

function renderRichText(richText: RichText[]): React.ReactNode {
  if (!richText || richText.length === 0) return null

  return richText.map((text, i) => {
    let content: React.ReactNode = text.plain_text

    if (text.annotations) {
      if (text.annotations.bold) content = <strong key={`b-${i}`}>{content}</strong>
      if (text.annotations.italic) content = <em key={`i-${i}`}>{content}</em>
      if (text.annotations.strikethrough) content = <s key={`s-${i}`}>{content}</s>
      if (text.annotations.underline) content = <u key={`u-${i}`}>{content}</u>
      if (text.annotations.code) content = <code key={`c-${i}`}>{content}</code>
    }

    if (text.href) {
      content = (
        <a key={`a-${i}`} href={text.href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      )
    }

    return <span key={i}>{content}</span>
  })
}

function renderChildren(children?: Block[]): React.ReactNode {
  if (!children || children.length === 0) return null
  return children.map((child) => <NotionBlock key={child.id} block={child} />)
}

export default function NotionBlock({ block }: { block: Block }) {
  const [isOpen, setIsOpen] = useState(true)

  switch (block.type) {
    case 'paragraph':
      return (
        <p className="notion-block notion-paragraph">
          {renderRichText(block.paragraph?.rich_text)}
        </p>
      )

    case 'heading_1':
      return (
        <h1 className="notion-block notion-heading-1">
          {renderRichText(block.heading_1?.rich_text)}
        </h1>
      )

    case 'heading_2':
      return (
        <h2 className="notion-block notion-heading-2">
          {renderRichText(block.heading_2?.rich_text)}
        </h2>
      )

    case 'heading_3':
      return (
        <h3 className="notion-block notion-heading-3">
          {renderRichText(block.heading_3?.rich_text)}
        </h3>
      )

    case 'bulleted_list_item':
      return (
        <li className="notion-block">
          {renderRichText(block.bulleted_list_item?.rich_text)}
          {block.has_children && block.children && (
            <ul className="notion-bulleted-list">{renderChildren(block.children)}</ul>
          )}
        </li>
      )

    case 'numbered_list_item':
      return (
        <li className="notion-block">
          {renderRichText(block.numbered_list_item?.rich_text)}
          {block.has_children && block.children && (
            <ol className="notion-numbered-list">{renderChildren(block.children)}</ol>
          )}
        </li>
      )

    case 'to_do':
      const checked = block.to_do?.checked
      return (
        <div className={`notion-block notion-to-do ${checked ? 'checked' : ''}`}>
          <input type="checkbox" checked={checked} readOnly />
          <span>{renderRichText(block.to_do?.rich_text)}</span>
        </div>
      )

    case 'toggle':
      return (
        <div className="notion-block notion-toggle">
          <div className="notion-toggle-header" onClick={() => setIsOpen(!isOpen)}>
            <span className={`notion-toggle-arrow ${isOpen ? 'open' : ''}`}>▶</span>
            {renderRichText(block.toggle?.rich_text)}
          </div>
          {isOpen && block.has_children && block.children && (
            <div className="notion-toggle-content">{renderChildren(block.children)}</div>
          )}
        </div>
      )

    case 'quote':
      return (
        <blockquote className="notion-block notion-quote">
          {renderRichText(block.quote?.rich_text)}
        </blockquote>
      )

    case 'callout':
      return (
        <div className="notion-block notion-callout">
          <span className="notion-callout-icon">
            {block.callout?.icon?.emoji || '💡'}
          </span>
          <div>{renderRichText(block.callout?.rich_text)}</div>
        </div>
      )

    case 'code':
      return (
        <pre className="notion-block notion-code">
          <code>{block.code?.rich_text?.map((t: RichText) => t.plain_text).join('')}</code>
        </pre>
      )

    case 'divider':
      return <hr className="notion-divider" />

    case 'image':
      const imageUrl =
        block.image?.type === 'external'
          ? block.image.external?.url
          : block.image?.file?.url
      return imageUrl ? (
        <img src={imageUrl} alt="" className="notion-block notion-image" />
      ) : null

    case 'bookmark':
      return (
        <a
          href={block.bookmark?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="notion-block notion-bookmark"
        >
          {block.bookmark?.url}
        </a>
      )

    case 'link_to_page':
      const pageId = block.link_to_page?.page_id
      return pageId ? (
        <Link href={`/page/${pageId}`} className="child-page-link">
          <span className="child-page-icon">📄</span>
          <span>Linked Page</span>
        </Link>
      ) : null

    case 'child_page':
      return (
        <Link href={`/page/${block.id}`} className="child-page-link">
          <span className="child-page-icon">📄</span>
          <span>{block.child_page?.title || 'Untitled'}</span>
        </Link>
      )

    case 'child_database':
      return (
        <Link href={`/page/${block.id}`} className="child-page-link">
          <span className="child-page-icon">📊</span>
          <span>{block.child_database?.title || 'Database'}</span>
        </Link>
      )

    case 'column_list':
      return (
        <div className="notion-block" style={{ display: 'flex', gap: '1rem' }}>
          {renderChildren(block.children)}
        </div>
      )

    case 'column':
      return <div style={{ flex: 1 }}>{renderChildren(block.children)}</div>

    case 'table':
      return (
        <table className="database-table">
          <tbody>{renderChildren(block.children)}</tbody>
        </table>
      )

    case 'table_row':
      return (
        <tr>
          {block.table_row?.cells?.map((cell: RichText[], i: number) => (
            <td key={i}>{renderRichText(cell)}</td>
          ))}
        </tr>
      )

    case 'embed':
    case 'video':
    case 'file':
    case 'pdf':
      return (
        <div className="notion-block">
          <a
            href={block[block.type]?.external?.url || block[block.type]?.file?.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            📎 View {block.type}
          </a>
        </div>
      )

    case 'synced_block':
      return <>{renderChildren(block.children)}</>

    case 'template':
    case 'unsupported':
      return null

    default:
      return null
  }
}

export function NotionBlockList({ blocks }: { blocks: Block[] }) {
  const result: React.ReactNode[] = []
  let currentList: Block[] = []
  let currentListType: string | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      if (currentListType === 'bulleted_list_item') {
        result.push(
          <ul key={`list-${result.length}`} className="notion-bulleted-list">
            {currentList.map((block) => (
              <NotionBlock key={block.id} block={block} />
            ))}
          </ul>
        )
      } else if (currentListType === 'numbered_list_item') {
        result.push(
          <ol key={`list-${result.length}`} className="notion-numbered-list">
            {currentList.map((block) => (
              <NotionBlock key={block.id} block={block} />
            ))}
          </ol>
        )
      }
      currentList = []
      currentListType = null
    }
  }

  blocks.forEach((block) => {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      if (currentListType === block.type) {
        currentList.push(block)
      } else {
        flushList()
        currentListType = block.type
        currentList.push(block)
      }
    } else {
      flushList()
      result.push(<NotionBlock key={block.id} block={block} />)
    }
  })

  flushList()
  return <>{result}</>
}
