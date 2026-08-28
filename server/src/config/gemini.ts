import type { GoogleGenAI } from "@google/genai" with { "resolution-mode": "import" };

import { ServiceUnavailableError } from "../utils/errors";

/**
 * Gemini client.
 *
 * Initialised lazily and cached, mirroring getFirebaseAuth(): the key is only
 * needed by the one feature that calls the model, so a deployment without it
 * still boots and serves every other route rather than crashing at import time.
 *
 * The import is dynamic because @google/genai is ESM-only while this server
 * compiles to CommonJS — a top-level `import` of it does not type-check under
 * module: Node16. Deferring it costs nothing here, since the client was
 * already being constructed on first use rather than at startup.
 */

let client: GoogleGenAI | null = null;

/**
 * Free tier by default. Flash is the model the free tier grants meaningful
 * request quota on; overridable so a paid deployment can point at a stronger
 * model without a code change.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // 503, not 500: the request was valid and the fix is operational (set a
    // key), not a bug in the caller's payload.
    throw new ServiceUnavailableError(
      "AI roadmap generation is not configured on this server.",
    );
  }

  if (!client) {
    const { GoogleGenAI: GenAI } = await import("@google/genai");
    client = new GenAI({ apiKey });
  }

  return client;
}

/** Test seam — the cached client would otherwise outlive an env change. */
export function resetGeminiClient() {
  client = null;
}
