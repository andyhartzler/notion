import { redirect } from 'next/navigation'

export default function HomePage() {
  const rootPageId = process.env.NOTION_ROOT_PAGE_ID
  if (!rootPageId) {
    return <div>Setup required - set NOTION_ROOT_PAGE_ID</div>
  }
  redirect(`/p/${rootPageId}`)
}
