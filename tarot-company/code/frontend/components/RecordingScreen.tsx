'use client'
// THEO-005: Voice recording component
// Four states: idle, recording, soft-warning (1:30), auto-stop (2:00)
// THEO-013: Dev text mode activated via NEXT_PUBLIC_DEV_TEXT_MODE=true

import { useState, useRef, useEffect, useCallback } from 'react'

const DEV_TEXT_MODE = process.env.NEXT_PUBLIC_DEV_TEXT_MODE === 'true'
const FINISH_UNLOCK_MS = 8_000
const SOFT_WARNING_MS = 90_000
const HARD_STOP_MS = 120_000
const BAR_COUNT = 28

interface Props {
  onRecordingComplete: (blob: Blob) => void
  onDevTextSubmit?: (text: string) => void
}

type RecordState = 'idle' | 'recording' | 'warning' | 'done'
type PermissionState = 'unknown' | 'granted' | 'denied'

export default function RecordingScreen({ onRecordingComplete, onDevTextSubmit }: Props) {
  const [recState, setRecState] = useState<RecordState>('idle')
  const [permission, setPermission] = useState<PermissionState>('unknown')
  const [elapsed, setElapsed] = useState(0)
  const [barHeights, setBarHeights] = useState<number[]>(Array(BAR_COUNT).fill(4))
  const [devText, setDevText] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hardStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const softWarnRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishUnlockRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [finishEnabled, setFinishEnabled] = useState(false)

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    cancelAnimationFrame(animFrameRef.current)
    clearInterval(timerRef.current!)
    clearTimeout(hardStopRef.current!)
    clearTimeout(softWarnRef.current!)
  }, [])

  useEffect(() => () => stopRecording(), [stopRecording])

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setPermission('granted')
      startRecording(stream)
    } catch {
      setPermission('denied')
    }
  }

  function startRecording(stream: MediaStream) {
    chunksRef.current = []

    // Detect supported MIME type — iOS Safari: mp4, Chrome/Android: webm
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/mp4'

    const mr = new MediaRecorder(stream, { mimeType })
    mediaRecorderRef.current = mr

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      onRecordingComplete(blob)
    }

    mr.start(100)
    setRecState('recording')
    startTimeRef.current = Date.now()
    setFinishEnabled(false)

    // Waveform visualizer
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    analyserRef.current = analyser
    ctx.createMediaStreamSource(stream).connect(analyser)
    animateWaveform(analyser)

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)

    // Unlock Finish after 8s
    finishUnlockRef.current = setTimeout(() => setFinishEnabled(true), FINISH_UNLOCK_MS)

    // Soft warning at 1:30
    softWarnRef.current = setTimeout(() => setRecState('warning'), SOFT_WARNING_MS)

    // Hard stop at 2:00
    hardStopRef.current = setTimeout(() => {
      setRecState('done')
      stopRecording()
    }, HARD_STOP_MS)
  }

  function animateWaveform(analyser: AnalyserNode) {
    const data = new Uint8Array(analyser.frequencyBinCount)
    function frame() {
      analyser.getByteFrequencyData(data)
      const heights = Array.from({ length: BAR_COUNT }, (_, i) => {
        const v = data[Math.floor((i / BAR_COUNT) * data.length)] / 255
        return Math.max(4, Math.round(v * 40))
      })
      setBarHeights(heights)
      animFrameRef.current = requestAnimationFrame(frame)
    }
    animFrameRef.current = requestAnimationFrame(frame)
  }

  function handleFinish() {
    setRecState('done')
    stopRecording()
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Dev text mode
  if (DEV_TEXT_MODE) {
    return (
      <div className="min-h-dvh flex flex-col justify-center py-16">
        <p className="font-display text-sm text-accent mb-4">[dev text mode]</p>
        <textarea
          className="w-full border border-accent bg-transparent font-body text-base p-3 h-40 resize-y mb-4"
          value={devText}
          onChange={(e) => setDevText(e.target.value)}
          placeholder="Type your transcript here..."
        />
        <button
          className="btn-primary"
          onClick={() => onDevTextSubmit?.(devText)}
          disabled={!devText.trim()}
        >
          Submit text
        </button>
      </div>
    )
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="min-h-dvh flex flex-col justify-center py-16">
        <p className="font-display text-[1.375rem] mb-4">Microphone access is needed.</p>
        <p className="font-body text-base leading-relaxed text-accent mb-8">
          Open your device settings and allow microphone access for this app,
          then return here.
        </p>
        <button className="btn-ghost" onClick={requestMic}>
          Try again
        </button>
      </div>
    )
  }

  // Idle state
  if (recState === 'idle') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center py-16 gap-6">
        <p className="font-body text-base text-center leading-relaxed">
          Speak what&apos;s present.<br />
          1–2 minutes is enough.
        </p>
        <button className="record-btn" onClick={requestMic} aria-label="Start recording" />
        <span className="font-display text-[3rem] font-light tabular-nums">0:00</span>
      </div>
    )
  }

  // Recording / warning states
  const isWarning = recState === 'warning'
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center py-16 gap-8">
      {/* Waveform */}
      <div className="flex items-end gap-[3px] h-10 w-full">
        {barHeights.map((h, i) => (
          <div key={i} className="waveform-bar flex-1" style={{ height: `${h}px` }} />
        ))}
      </div>

      {/* Timer */}
      <div className="text-center">
        <span
          className="font-display text-[3rem] font-light tabular-nums"
          style={{ color: isWarning ? 'var(--c-accent)' : 'var(--c-text)' }}
        >
          {formatTime(elapsed)}
        </span>
        {isWarning && (
          <p className="font-display text-xs font-light text-accent mt-1">Wrapping up</p>
        )}
      </div>

      {/* Finish button — unlocks after 8s */}
      {finishEnabled && (
        <button className="btn-primary" onClick={handleFinish}>
          Finish
        </button>
      )}
    </div>
  )
}
