'use client'
// Root page — manages top-level app screen state
// All screens share this page; navigation is in-memory state (no Next.js routing needed for prototype)

import { useState, useEffect } from 'react'
import { getDeviceToken, isDisclosed } from '@/lib/device'
import { registerDevice, uploadText } from '@/lib/api'
import DisclosureScreen from '@/components/DisclosureScreen'
import HomeScreen from '@/components/HomeScreen'
import RecordingScreen from '@/components/RecordingScreen'
import ReviewScreen from '@/components/ReviewScreen'
import ProcessingScreen from '@/components/ProcessingScreen'
import ReadingScreen from '@/components/ReadingScreen'
import { WarmNoAbstain, WarmNoError } from '@/components/WarmNo'
import type { ReadingObject } from '@/lib/types'

type Screen =
  | 'disclosure'
  | 'home'
  | 'recording'
  | 'review'
  | 'processing'
  | 'reading'
  | 'warm_no_abstain'
  | 'warm_no_error'

const DEV_TEXT_MODE = process.env.NEXT_PUBLIC_DEV_TEXT_MODE === 'true'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [reading, setReading] = useState<ReadingObject | null>(null)

  useEffect(() => {
    // Ensure device token exists and register on first load
    getDeviceToken()
    registerDevice().catch(() => {})

    if (!isDisclosed()) setScreen('disclosure')
  }, [])

  function handleRecordingComplete(blob: Blob) {
    setAudioBlob(blob)
    setScreen('review')
  }

  async function handleDevText(text: string) {
    try {
      const { session_id } = await uploadText(text)
      setSessionId(session_id)
      setScreen('processing')
    } catch {
      setScreen('warm_no_error')
    }
  }

  function handleSubmit(sid: string) {
    setSessionId(sid)
    setScreen('processing')
  }

  function handleReading(r: ReadingObject) {
    setReading(r)
    setScreen('reading')
  }

  return (
    <>
      {screen === 'disclosure' && (
        <DisclosureScreen onConfirm={() => setScreen('home')} />
      )}

      {screen === 'home' && (
        <HomeScreen
          onRecord={() => setScreen('recording')}
          onLastReading={(r) => { setReading(r); setScreen('reading') }}
        />
      )}

      {screen === 'recording' && (
        <RecordingScreen
          onRecordingComplete={handleRecordingComplete}
          onDevTextSubmit={DEV_TEXT_MODE ? handleDevText : undefined}
        />
      )}

      {screen === 'review' && audioBlob && (
        <ReviewScreen
          audioBlob={audioBlob}
          onSubmit={handleSubmit}
          onReRecord={() => setScreen('recording')}
        />
      )}

      {screen === 'processing' && sessionId && (
        <ProcessingScreen
          sessionId={sessionId}
          onReading={handleReading}
          onAbstain={() => setScreen('warm_no_abstain')}
          onError={() => setScreen('warm_no_error')}
        />
      )}

      {screen === 'reading' && reading && (
        <ReadingScreen reading={reading} onHome={() => setScreen('home')} />
      )}

      {screen === 'warm_no_abstain' && (
        <WarmNoAbstain onRecordAgain={() => setScreen('recording')} />
      )}

      {screen === 'warm_no_error' && (
        <WarmNoError onTryAgain={() => setScreen('home')} />
      )}
    </>
  )
}
