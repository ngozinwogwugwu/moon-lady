'use client'
// THEO-012: Warm no screens — Abstain and Pipeline Failure
// Renders in the main content area — not a modal, not an error page.

interface AbstainProps {
  onRecordAgain: () => void
}

export function WarmNoAbstain({ onRecordAgain }: AbstainProps) {
  return (
    <div className="py-8 pb-16">
      {/* Three face-down card backs */}
      <div className="flex flex-col gap-8 mb-12">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-back w-full aspect-[2/3]" />
        ))}
      </div>

      <p className="font-display text-[1.125rem] font-normal mb-3">
        I don&apos;t have enough to work with yet.
      </p>
      <p className="font-body text-base leading-relaxed text-accent mb-8">
        Try again with 45–90 seconds about what feels most active right now.
      </p>

      <button className="btn-primary" onClick={onRecordAgain}>
        Record again
      </button>
    </div>
  )
}

interface FailureProps {
  onTryAgain: () => void
}

export function WarmNoError({ onTryAgain }: FailureProps) {
  return (
    <div className="min-h-dvh flex flex-col justify-center py-16">
      <p className="font-display text-[1.125rem] font-normal mb-8">
        Something went wrong.<br />
        Your words didn&apos;t make it through.
      </p>
      <button className="btn-primary" onClick={onTryAgain}>
        Try again
      </button>
    </div>
  )
}
