# Deep Research: Implementation Questions (V0)

1. What is the estimated cost per session — Stage A call, Stage B call, and storage combined?
2. What is the minimum data model for a session record — what fields are required at V0?
3. How is the transcript handled — stored raw, hashed, or transformed before storage?
4. What encryption scheme is forward-compatible with future at-rest encryption requirements?
5. What metadata do the three telemetry events (transcript stored, spread stored, interpretation stored) carry?
6. Where does "one reading per day" state live — client, server, or both?
7. What are the failure modes — what happens when Stage A or Stage B returns an unexpected or malformed response?
8. What is the API contract between Stage A and Stage B — request shape, response shape, error handling?
9. What latency is acceptable for a reading session end-to-end — what is the target and the hard ceiling?
10. What does V0 infrastructure look like at 10, 100, and 1000 users — where are the scaling breakpoints?

# Implementation Plan for V0

## 1. Cost per Session

Each session entails a Stage A call (e.g. transcription), a Stage B call (LLM processing), and storing results. Using public cloud rates as examples: Whisper audio transcription is **$0.006 per minute**【15†L900-L904】, so a 5–10 min recording costs only a few cents. GPT-3.5-turbo (v0) costs **$0.50 per 1K input tokens and $1.50 per 1K output tokens**【60†L978-L986】. For instance, a 1,000-token prompt + 500-token response costs about $0.0125 total. In practice Stage A might be ~$0.01–0.05 and Stage B ~$0.01–0.02 per session. Storage (e.g. Azure Cosmos DB) is **$0.25 per GB-month**【22†L157-L164】 (and 1000 RUs per million ops). Since each session record/transcript is typically kilobytes, storage costs are negligible (fractions of a cent per session). In summary, a session is on the order of **a few cents** (or less) in compute+storage using these rates.

- **Stage A call (transcription):** ~$0.006/minute of audio【15†L900-L904】.
- **Stage B call (LLM):** e.g. GPT-3.5-turbo at $0.50/$1.50 per 1K tokens【60†L978-L986】. Typical prompt/output (1–2K tokens) ⇒ ~$0.01–0.02.
- **Storage:** $0.25/GB-month【22†L157-L164】. A few KB transcript or JSON is ~$0.0000006 per month.

## 2. Minimal Session Data Model

A V0 session record should contain only the essential fields needed to track a reading. At minimum, include:

- **Session ID:** unique identifier (primary key).
- **User ID:** (or anonymous ID) to associate the session.
- **Timestamps:** e.g. `startTime`, `endTime` (or creation time).
- **Stage A result:** pointer or field for the transcript (e.g. `transcriptText` or a blob URL).
- **Stage B result:** fields for the “spread” and “interpretation” output (e.g. `spreadData`, `interpretationText`).
- **Status/Flags:** e.g. `completed` or error flag, and a reference to the “one-per-day” check if needed.

All other fields (e.g. analytics, logs) can be secondary. Designing for future V1, you may include placeholders for things like encryption keys or versioning, but V0 should keep the schema minimal.

## 3. Transcript Handling (Storage)

We assume transcripts are used by Stage B and may need auditing, so store them (not just a hash). Best practice is to **encrypt transcripts at rest** rather than relying on client secrecy. For example, Microsoft’s guidance is to use strong symmetric encryption (AES-256) for at-rest data【33†L59-L68】. In practice, one might:

- Store the raw text (e.g. JSON or text) in the database or blob storage.
- Use server-side encryption (e.g. Azure Storage Service Encryption with AES-256) or client-side envelope encryption with a key vault.
- If privacy is critical and transcripts aren’t needed in plain text, you could instead store a cryptographic hash (which is irreversible) for verification. However, hashing would prevent re-reading the transcript, so typically we encrypt the raw text instead of hashing.

Thus, transcripts are kept in full (possibly for review or debugging) but protected by at-rest encryption. For example, Azure services support AES-256 encryption by default【33†L59-L68】, and one can use customer-managed keys to add layers of security【33†L162-L168】.

## 4. Encryption Scheme (Forward-Compatible)

To meet current and future at-rest encryption requirements, use an industry-standard, flexible scheme. In practice, use **AES-256 envelope encryption** with a KMS or Key Vault. This means: encrypt each transcript with a unique Data Encryption Key (DEK) (symmetric AES-256), then encrypt the DEKs with a master key stored in a secure vault (a Customer-Managed Key, CMK). AES-256 is widely supported for at-rest data【33†L59-L68】, and the envelope approach allows easy key rotation later. For example, Azure Cosmos DB uses AES-256 by default and allows a _second layer_ of encryption with your own CMK【33†L162-L168】. By using AES-256 and key-vault-based key management, you ensure compatibility with stricter future requirements (just rotate or replace the keys as needed).

## 5. Telemetry Event Metadata

The three custom events (`TranscriptStored`, `SpreadStored`, `InterpretationStored`) should carry common context and relevant properties. Each event should include:

- **Session ID:** to tie events to the session (e.g. `context.Session.Id`)【27†L136-L144】【37†L61-L69】.
- **User ID (anonymized):** application-insights automatically includes an anonymous user and session ID【37†L61-L69】, so leverage that.
- **Timestamp:** when the event occurred (usually automatic).
- **Event Name:** e.g. `"TranscriptStored"`, `"SpreadStored"`, etc. Keep names consistent (don’t encode unique details in the name)【30†L262-L269】.
- **Status/Result:** e.g. success/failure flag or error code.
- **Content-specific details:** for `TranscriptStored`, you might include `transcriptLength` (chars) or a hash of the transcript; for `SpreadStored`, maybe `spreadId` or number of cards; for `InterpretationStored`, perhaps `interpretationLength`.

In Azure Application Insights terms, you would use an event telemetry item with `Name` = event type【30†L262-L269】, and custom properties for the above. In general, follow telemetry best practices: include correlation IDs (session/user)【27†L136-L144】【37†L61-L69】 and any custom fields that help trace what happened in that step.

## 6. “One Reading per Day” State Location

The one-per-day rule must be _enforced on the server side_ (with a timestamp in the user’s record or session). The client may also cache the fact (e.g. disable the “new reading” button after one use) for UX, but it cannot be the authority. Insecure client-side checks are unreliable (clients can be spoofed or tampered with)【44†L82-L84】. Thus, store the last-reading timestamp on the server (in the user profile or a session table). On each new request, the server checks if 24 hours have passed. The client can keep a “daily limit used” flag to adjust UI, but **only the server can truly enforce** the one-per-day rule【44†L82-L84】.

## 7. Failure Modes for Stage A/B

Design for these common failure modes:

- **Network/API errors:** timeouts, DNS failures, service-unavailable (5xx) or rate-limit (429) from Stage A/B. Handle with retries/backoff as appropriate and return an error to the user if persistent.
- **Invalid input:** if Stage A requires audio but gets corrupt data, return 400 Bad Request.
- **Malformed output:** e.g. Stage B (LLM) returns non-JSON or malformed text. In that case, log the incident and consider a retry with stricter instructions. In LLM integration patterns, one strategy is to re-invoke the model with a prompt like “_Your previous answer was malformed. Please respond with valid JSON._”【48†L246-L249】. If retries fail, the session should be marked failed and the user informed.
- **Semantic errors:** Stage B might return an answer that doesn’t make sense (hallucination) or refusal. These should be caught and handled as failures.
- **Partial failures:** If Stage A fails (no transcript), Stage B shouldn’t be called and the session should abort. If Stage B fails after Stage A succeeded, you may still want to keep the transcript stored, but mark the interpretation as failed.

In all cases, log the error (with stack trace or error code) for debugging. Use standard HTTP status codes (see below) for responses. Internally, implement guards: validate Stage A’s response (e.g. non-empty transcript) before calling Stage B; wrap Stage B’s parsing in try/catch and handle `JSON.parse` errors.

## 8. API Contract Between Stage A and B

Define a clear JSON contract for each call. For example:

- **Stage A (Transcription) – Request:**

  ```json
  {
    "sessionId": "abc123",
    "audioBase64": "ABCD..."
  }
  ```

  **Response (200):**

  ```json
  {
    "transcript": "recognized text here",
    "durationSeconds": 37.2,
    "confidence": 0.92
  }
  ```

  **Error:** use appropriate HTTP status (400 for bad input, 500 for server error) and a JSON error body. For example:

  ```json
  HTTP 400 Bad Request
  {
    "error": "invalid_audio",
    "message": "Audio data missing or corrupt."
  }
  ```

- **Stage B (Interpretation) – Request:**
  ```json
  {
    "sessionId": "abc123",
    "transcript": "text from Stage A"
  }
  ```
  **Response (200):**
  ```json
  {
    "spread": {
      /* e.g. card names or positions */
    },
    "interpretation": "AI-generated interpretation text"
  }
  ```
  **Error:** similarly, use 4xx/5xx codes. Include a JSON body with fields like `"error"` and `"message"`【52†L383-L391】. For example:
  ```json
  HTTP 500 Internal Server Error
  {
    "error": "llm_timeout",
    "message": "Interpretation service timed out"
  }
  ```

Always use consistent field names and schema. It’s advisable to document these endpoints with OpenAPI/Swagger. In responses, prefer **specific status codes** for problems (400 = client error, 401/403 auth, 500=server error, etc.) rather than a generic 200 with an error field【52†L299-L307】. If detailed errors are needed, follow a structure like the IETF problem-details (RFC7807) or a simple `{error, message, detail}` format【52†L383-L391】.

## 9. Acceptable Latency (End-to-End)

Usability studies (Nielsen) suggest **~1 second** is the limit for users to feel a system is “instant”【54†L159-L168】. Delays beyond 1s should show a busy indicator, and anything approaching **10 seconds** risks losing user attention【54†L170-L178】. Thus for a reading session:

- **Target:** aim for a couple of seconds (e.g. <2–3s) end-to-end. This keeps the UI responsive and flows naturally.
- **Hard ceiling:** strive to keep under ~10 seconds total. If it must be longer, show progress feedback (e.g. a spinner or progress bar) to reassure the user【54†L159-L168】【54†L170-L178】.

For example, if transcription takes several seconds for long audio, show a “processing…” indicator. If interpretation (LLM) call is slow (e.g. due to long prompt), show a progress UI. But as a rule of thumb, design for **sub-second to a few-second** interactions, since >10s is generally the upper UX limit【54†L159-L168】【54†L170-L178】.

## 10. V0 Infrastructure and Scaling

At V0, infrastructure can start small and scale as users grow:

- **~10 users:** A single app server or function app (consumption plan) and one database instance easily suffice. For example, a single Azure Function instance and a small Cosmos DB container (or even a free-tier database) can handle this load. Azure’s free tier (25 GB storage, 1,000 RU/s)【65†L15-L23】 covers small usage out of the box.
- **~100 users:** Traffic is still low. Auto-scaling triggers as needed. For instance, Azure Functions can spin up multiple instances. Cosmos DB throughput may remain near the free threshold (1000 RU/s) for 100 writes per minute is only ~500 RU/s (since ~5 RU per 1KB write)【22†L157-L164】【65†L15-L23】. You might monitor usage and switch from free-tier to provisioned RUs (~400–1000 RU/s) if needed. A few (2–5) function instances could run in parallel to serve bursts.
- **~1000 users:** Now scale-out is important. In a consumption/serverless model, Azure Functions can scale to **dozens of instances** (up to ~100–200 on Consumption plan)【58†L276-L280】. This handles concurrent Stage A/B calls. Cosmos DB still handles this easily (even 5,000 writes per minute is just a few thousand RU/s; note free-tier covers 400 RU/s and 5 GB/month usage【65†L15-L23】). If demand grows, you would move to higher tiers: e.g. Azure Container Apps or App Service with autoscale, and increase Cosmos throughput.

In summary, V0 infra is minimal (single node or serverless) at first. Around 100 users you just rely on cloud autoscaling. At 1000+ users you ensure horizontal scaling is enabled (e.g. multiple Function or App Service instances, provisioned RUs)【58†L276-L280】. The “breakpoint” is when one instance’s CPU or memory saturates or when throughput/RUs approach configured limits. At that point, add instances or raise quotas. With Azure’s autoscale (200-instance cap【58†L276-L280】 and Cosmos free tier【65†L15-L23】), V0 can cover hundreds of users before manual scaling is needed.

**Sources:** Azure OpenAI pricing【15†L900-L904】【60†L978-L986】, Azure Cosmos pricing【22†L157-L164】【65†L15-L23】, Azure encryption best practices【33†L59-L68】【33†L162-L168】, Azure Application Insights telemetry model【27†L136-L144】【30†L262-L269】, system design/rate-limit best practices【44†L82-L84】, LLM error-handling patterns【48†L246-L249】, and Nielsen UX latency guidelines【54†L159-L168】【54†L170-L178】.
