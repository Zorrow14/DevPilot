import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// src/lib/firebase.ts calls getAuth() at module scope, so merely importing
// anything downstream of it (AuthProvider, LogoutButton, the auth pages) throws
// auth/invalid-api-key without real credentials. Stubbed globally because no
// unit test should depend on a live Firebase project; tests that care about
// auth behaviour drive it through AuthContext instead.
vi.mock("@/src/lib/firebase", () => ({
  auth: {},
  googleProvider: {},
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
