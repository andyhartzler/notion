'use client'

import { useEffect, useState } from 'react'

const DATES = {
  electionDay: new Date('2026-04-07'),
  campaignLaunch: new Date('2026-02-02'),
}

function getDaysUntil(targetDate: Date): number {
  const now = new Date()
  const diffTime = targetDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function CountdownWidget() {
  const [mounted, setMounted] = useState(false)
  const [daysUntilElection, setDaysUntilElection] = useState(0)
  const [daysUntilLaunch, setDaysUntilLaunch] = useState(0)

  useEffect(() => {
    setMounted(true)

    const updateCountdown = () => {
      setDaysUntilElection(getDaysUntil(DATES.electionDay))
      setDaysUntilLaunch(getDaysUntil(DATES.campaignLaunch))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      padding: '16px 20px',
      background: '#2f2f2f',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        color: '#9a9a9a',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        <span style={{ fontSize: '16px' }}>📅</span>
        Key Dates
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#3b3b3b',
          padding: '12px 16px',
          borderRadius: '6px',
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#e0e0e0',
              marginBottom: '2px'
            }}>
              Election Day
            </div>
            <div style={{ fontSize: '12px', color: '#808080' }}>
              April 7, 2026
            </div>
          </div>
          <div style={{
            background: '#0077C8',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '15px',
            fontWeight: 700,
          }}>
            {daysUntilElection} days
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#3b3b3b',
          padding: '12px 16px',
          borderRadius: '6px',
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#e0e0e0',
              marginBottom: '2px'
            }}>
              Campaign Launch
            </div>
            <div style={{ fontSize: '12px', color: '#808080' }}>
              February 2, 2026
            </div>
          </div>
          <div style={{
            background: daysUntilLaunch <= 7 ? '#C8102E' : '#0077C8',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '15px',
            fontWeight: 700,
          }}>
            {daysUntilLaunch} days
          </div>
        </div>
      </div>
    </div>
  )
}
