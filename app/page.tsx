import { redirect } from 'next/navigation'

// Together KC Command Center page ID
const ROOT_PAGE_ID = '2efc4b28b1ea8174b74fd0a4a148c5d0'

export default function HomePage() {
  redirect(`/p/${ROOT_PAGE_ID}`)
}
