'use client'
// THEO-006: Review screen and background upload
// Upload begins immediately when this screen mounts — before Submit is tapped.

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { uploadAudio } from '@/lib/api'

interface Props {
  audioBlob: Blob
  onSubmit: (sessionId: string) => void
  onReRecord: () => void
}

export default function ReviewScreen({ audioBlob, onSubmit, onReRecord }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadState, setUploadState] = useState<'uploading' | 'done' | 'error'>('uploading')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitWaiting, setSubmitWaiting] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrl = useRef(URL.createObjectURL(audioBlob))

  // Background upload begins immediately on mount
  useEffect(() => {
    uploadAudio(audioBlob)
      .then(({ session_id }) => {
        setSessionId(session_id)
        setUploadState('done')
        // If Submit was tapped while uploading, proceed now
        if (submitWaiting) onSubmit(session_id)
      })
      .catch(() => setUploadState('error'))

    return () => URL.revokeObjectURL(audioUrl.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play(); setIsPlaying(true) }
  }

  function handleSubmit() {
    if (sessionId) {
      onSubmit(sessionId)
    } else {
      // Upload still in flight — wait for it
      setSubmitWaiting(true)
    }
  }

  async function handleRetry() {
    setUploadState('uploading')
    try {
      const { session_id } = await uploadAudio(audioBlob)
      setSessionId(session_id)
      setUploadState('done')
    } catch {
      setUploadState('error')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center py-16 gap-8">
      <audio ref={audioRef} src={audioUrl.current} onEnded={() => setIsPlaying(false)} />

      {/* Playback control */}
      <div className="flex items-center gap-4">
        <button onClick={togglePlayback} className="text-accent" aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <span className="font-display text-sm text-accent">Review your recording</span>
      </div>

      {/* Upload error */}
      {uploadState === 'error' && (
        <div className="text-center">
          <p className="font-body text-sm text-accent mb-3">
            Upload didn&apos;t complete. Try again?
          </p>
          <button className="btn-ghost" onClick={handleRetry}>
            Retry upload
          </button>
        </div>
      )}

      {/* Waiting indicator */}
      {submitWaiting && uploadState === 'uploading' && (
        <p className="font-display text-sm text-accent text-center">One moment...</p>
      )}

      <div className="flex flex-col gap-3">
        <button className="btn-primary" onClick={handleSubmit} disabled={uploadState === 'error'}>
          Submit
        </button>
        <button className="btn-ghost text-center" onClick={onReRecord}>
          Re-record
        </button>
      </div>

      {/* Transparency line */}
      <p className="font-body text-[0.8125rem] italic text-center text-accent">
        Audio is transcribed and stored temporarily for internal review.
      </p>
    </div>
  )
}
