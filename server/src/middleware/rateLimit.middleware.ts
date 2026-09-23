import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

/**
 * Rate limiting.
 *
 * The limits below are deliberately generous for the normal API and tight for
 * roadmap generation, because those two failure modes cost different things: a
 * burst of dashboard reads costs some Postgres time, while a burst of
 * generations spends a shared free-tier Gemini quota that, once exhausted,
 * takes the feature down for every user until the window resets.
 *
 * The store is in-memory, so counters are per-process and reset on deploy. That
 * is the right trade for a single instance; running more than one means a user
 * gets the limit once per instance, and the fix is a shared store (Redis) via
 * this module rather than changes at the call sites.
 */

/** Counts an authenticated caller by account, falling back to IP. */
function userOrIpKey(req: Request): string {
  const userId = req.user?.dbUserId;

  if (userId) {
    return `user:${userId}`;
  }

  // ipKeyGenerator normalises IPv6 to a /64 subnet. Calling it rather than
  // using req.ip raw is what stops a single client cycling through addresses
  // inside its own prefix to reset the counter.
  return ipKeyGenerator(req.ip ?? "");
}

/**
 * Blanket limit across /api. Sized to be invisible to a person using the app —
 * a dashboard load is a handful of requests — while still capping a runaway
 * client or a scripted scrape.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { message: "Too many requests. Please try again shortly." },
});

/**
 * Roadmap generation: the one endpoint that spends money and shared quota.
 *
 * Keyed by account rather than IP on purpose. This route sits behind
 * authMiddleware, so the account is always known, and an IP key would lump
 * every user behind one campus or office NAT into a single bucket — throttling
 * bystanders instead of the caller actually generating.
 */
export const roadmapGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  // Successful generations are the expensive ones, but failed attempts still
  // reach Gemini, so they are counted too.
  message: {
    message: "Roadmap generation limit reached. Please try again in an hour.",
  },
});
