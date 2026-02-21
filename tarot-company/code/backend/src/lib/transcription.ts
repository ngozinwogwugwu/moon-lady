// OMAR-004: Transcription service
// Audio is never written to disk. The File object is passed directly to Whisper.
// Audio blob is eligible for GC immediately after transcription completes.

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export class TranscriptionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'TranscriptionError'
  }
}

// Accepts any format Whisper supports: webm, mp4, ogg, m4a, wav, flac
// No transcoding — pass-through to the API
export async function transcribe(audioFile: File): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    })
    // audioFile is no longer referenced after this function returns — eligible for GC
    return transcription.text
  } catch (err) {
    throw new TranscriptionError('Whisper transcription failed', err)
  }
}
