import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: {
    upsert: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));

const { getFirebaseUserInfo, syncFirebaseUser } = await import("./auth.service");
const { ValidationError } = await import("../utils/errors");

const ORIGINAL = process.env.ADMIN_EMAILS;

/** The upsert argument, which is what these tests actually assert on. */
function upsertArg() {
  return prismaMock.user.upsert.mock.calls[0][0];
}

function firebaseUser(overrides: Record<string, unknown> = {}) {
  return {
    firebaseUid: "firebase-1",
    email: "dev@example.com",
    name: "Dev",
    picture: "https://example.test/avatar.png",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.ADMIN_EMAILS;
  prismaMock.user.upsert.mockResolvedValue({ id: "user-1" });
});

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = ORIGINAL;
  }
});

describe("getFirebaseUserInfo", () => {
  it("maps the claims the app stores off a decoded token", () => {
    expect(
      getFirebaseUserInfo({
        uid: "firebase-1",
        email: "dev@example.com",
        name: "Dev",
        picture: "https://example.test/avatar.png",
      } as never),
    ).toEqual({
      firebaseUid: "firebase-1",
      email: "dev@example.com",
      name: "Dev",
      picture: "https://example.test/avatar.png",
    });
  });

  it("falls back to an empty email when the token carries none", () => {
    expect(getFirebaseUserInfo({ uid: "firebase-1" } as never).email).toBe("");
  });
});

describe("syncFirebaseUser", () => {
  it("rejects a token with no email rather than creating a row without one", async () => {
    await expect(syncFirebaseUser(firebaseUser({ email: "" }))).rejects.toThrow(ValidationError);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it("upserts on firebaseUid, the stable identifier", async () => {
    await syncFirebaseUser(firebaseUser());
    expect(upsertArg().where).toEqual({ firebaseUid: "firebase-1" });
  });

  it("falls back to the email as a display name when the token has no name", async () => {
    await syncFirebaseUser(firebaseUser({ name: undefined }));
    expect(upsertArg().create.name).toBe("dev@example.com");
    expect(upsertArg().update.name).toBe("dev@example.com");
  });

  describe("when the address is not a bootstrap admin", () => {
    it("creates the account as a plain USER", async () => {
      await syncFirebaseUser(firebaseUser());
      expect(upsertArg().create.role).toBe("USER");
    });

    it("leaves the role alone on an existing account", async () => {
      await syncFirebaseUser(firebaseUser());
      expect(upsertArg().update).not.toHaveProperty("role");
    });

    // The regression that matters: an admin promoted through the admin screens
    // is not in ADMIN_EMAILS, so writing role on every sync would demote them
    // on their very next request.
    it("does not demote an admin promoted through the admin screens", async () => {
      process.env.ADMIN_EMAILS = "founder@example.com";
      await syncFirebaseUser(firebaseUser({ email: "promoted@example.com" }));
      expect(upsertArg().update).not.toHaveProperty("role");
    });
  });

  describe("when the address is a bootstrap admin", () => {
    beforeEach(() => {
      process.env.ADMIN_EMAILS = "founder@example.com";
    });

    it("creates the account as an ADMIN", async () => {
      await syncFirebaseUser(firebaseUser({ email: "founder@example.com" }));
      expect(upsertArg().create.role).toBe("ADMIN");
    });

    // Promotion on update is what lets the variable be set after the founder
    // has already signed up, which is the normal order of events.
    it("promotes an account that already exists", async () => {
      await syncFirebaseUser(firebaseUser({ email: "founder@example.com" }));
      expect(upsertArg().update.role).toBe("ADMIN");
    });

    it("promotes regardless of the casing on the address", async () => {
      await syncFirebaseUser(firebaseUser({ email: "Founder@Example.com" }));
      expect(upsertArg().update.role).toBe("ADMIN");
    });

    it("promotes an address listed alongside others", async () => {
      process.env.ADMIN_EMAILS = "one@example.com, founder@example.com";
      await syncFirebaseUser(firebaseUser({ email: "founder@example.com" }));
      expect(upsertArg().update.role).toBe("ADMIN");
    });
  });
});
