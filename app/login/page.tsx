'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/')
        router.refresh()
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔒</div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
