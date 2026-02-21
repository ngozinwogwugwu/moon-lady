'use client'
// THEO-003: First-use disclosure screen

import { confirmDisclosure, registerDevice } from '@/lib/api'
import { markDisclosed } from '@/lib/device'

interface Props {
  onConfirm: () => void
}

export default function DisclosureScreen({ onConfirm }: Props) {
  async function handleGotIt() {
    await registerDevice()
    await confirmDisclosure()
    markDisclosed()
    onConfirm()
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center py-16">
      <h1 className="font-display text-[1.375rem] font-normal mb-6">
        Before you begin
      </h1>
      <p className="font-body text-base leading-relaxed mb-8">
        Your voice memo will be transcribed so the app can work with what you
        said. During this prototype, transcripts are kept temporarily for
        internal review. They are not shared or sold.
      </p>
      <button className="btn-primary" onClick={handleGotIt}>
        Got it
      </button>
    </div>
  )
}
