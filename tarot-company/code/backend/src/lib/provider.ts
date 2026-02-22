// OMAR-003: Provider abstraction layer
// temperature is NOT a parameter — it is hardcoded to 0 internally.
// Any caller that tries to pass temperature is rejected by TypeScript (not in ProviderConfig).

import Anthropic from '@anthropic-ai/sdk'

const TEMPERATURE = 0 // sealed — never exposed

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ProviderConfig {
  maxTokens: number
  timeoutMs: number
  tools?: Anthropic.Tool[]
  toolChoice?: Anthropic.ToolChoiceAuto | Anthropic.ToolChoiceTool
}

export type ProviderResult =
  | {
      ok: true
      content: Anthropic.ContentBlock[]
      modelId: string
      provider: 'anthropic'
      latencyMs: number
      tokensUsed: { input: number; output: number }
    }
  | {
      ok: false
      error: 'timeout' | 'provider_error'
      latencyMs: number
      message?: string
    }

// OMAR-003: Stage A timeout = 4000ms, Stage B timeout = 9000ms (set by caller in config)
export async function complete(
  systemPrompt: string,
  userMessage: string,
  config: ProviderConfig
): Promise<ProviderResult> {
  return attempt(systemPrompt, userMessage, config, 0)
}

async function attempt(
  systemPrompt: string,
  userMessage: string,
  config: ProviderConfig,
  retryCount: number
): Promise<ProviderResult> {
  const start = Date.now()

  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: 'claude-sonnet-4-6',
    max_tokens: config.maxTokens,
    temperature: TEMPERATURE, // hardcoded — not derived from config
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  }

  if (config.tools) {
    params.tools = config.tools
    params.tool_choice = config.toolChoice
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.timeoutMs)

  try {
    const response = await anthropic.messages.create(params, {
      signal: controller.signal,
    })
    clearTimeout(timer)

    const latencyMs = Date.now() - start

    // OMAR-003: every call logs model metadata
    console.log(
      JSON.stringify({
        model_provider: 'anthropic',
        model_id: response.model,
        latency_ms: latencyMs,
        tokens_used_input: response.usage.input_tokens,
        tokens_used_output: response.usage.output_tokens,
      })
    )

    return {
      ok: true,
      content: response.content,
      modelId: response.model,
      provider: 'anthropic',
      latencyMs,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    }
  } catch (err: unknown) {
    clearTimeout(timer)
    const latencyMs = Date.now() - start

    // OMAR-003: retry on 429/5xx/network errors only, max 2 retries, exponential backoff with jitter
    if (retryCount < 2 && isRetryable(err)) {
      const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500
      await sleep(delay)
      return attempt(systemPrompt, userMessage, config, retryCount + 1)
    }

    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, error: 'timeout', latencyMs }
    }

    return {
      ok: false,
      error: 'provider_error',
      latencyMs,
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

function isRetryable(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) {
    return err.status === 429 || err.status >= 500
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    return msg.includes('econnreset') || msg.includes('econnrefused') || msg.includes('network')
  }
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
