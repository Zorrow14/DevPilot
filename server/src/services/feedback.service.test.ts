import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  feedback: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));

const feedbackService = await import("./feedback.service");
const { NotFoundError, ValidationError } = await import("../utils/errors");

const OWNER = "owner-user-id";

function storedFeedback(overrides: Record<string, unknown> = {}) {
  return {
    id: "feedback-1",
    userId: OWNER,
    title: "Dashboard is slow",
    message: "The readiness gauge takes a few seconds to appear.",
    type: "BUG",
    status: "NEW",
    createdAt: new Date("2026-08-20T09:00:00.000Z"),
    updatedAt: new Date("2026-08-21T09:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.feedback.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve(storedFeedback(data)),
  );
});

describe("createFeedback", () => {
  it("attaches the submission to the requesting user", async () => {
    await feedbackService.createFeedback(OWNER, { title: "T", message: "M" });

    expect(prismaMock.feedback.create.mock.calls[0][0].data.userId).toBe(OWNER);
  });

  it("defaults to GENERAL when no type is given", async () => {
    await feedbackService.createFeedback(OWNER, { title: "T", message: "M" });

    expect(prismaMock.feedback.create.mock.calls[0][0].data.type).toBe("GENERAL");
  });

  it("accepts the lowercase type the client sends", async () => {
    await feedbackService.createFeedback(OWNER, { title: "T", message: "M", type: "bug" });

    expect(prismaMock.feedback.create.mock.calls[0][0].data.type).toBe("BUG");
  });

  it("rejects a submission with no message", async () => {
    await expect(feedbackService.createFeedback(OWNER, { title: "T" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("rejects an unknown type rather than storing a default", async () => {
    await expect(
      feedbackService.createFeedback(OWNER, { title: "T", message: "M", type: "urgent" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("serialization", () => {
  it("converts the Prisma enums to the lowercase/kebab forms the client uses", async () => {
    prismaMock.feedback.findMany.mockResolvedValue([
      storedFeedback({ type: "FEATURE", status: "IN_REVIEW" }),
    ]);

    const [item] = await feedbackService.getMyFeedback(OWNER);

    expect(item.type).toBe("feature");
    expect(item.status).toBe("in-review");
    expect(item.createdAt).toBe("2026-08-20");
  });

  it("leaves the submitter name blank when the user was not joined in", async () => {
    // A user listing their own feedback does not need the join, and the field
    // must not render as "undefined".
    prismaMock.feedback.findMany.mockResolvedValue([storedFeedback()]);

    const [item] = await feedbackService.getMyFeedback(OWNER);

    expect(item.userName).toBe("");
  });

  it("includes the submitter for the admin triage list", async () => {
    prismaMock.feedback.findMany.mockResolvedValue([
      { ...storedFeedback(), user: { id: OWNER, name: "Ada", email: "ada@example.com" } },
    ]);

    const [item] = await feedbackService.getAllFeedback();

    expect(item.userName).toBe("Ada");
    expect(item.userEmail).toBe("ada@example.com");
  });
});

describe("getMyFeedback", () => {
  it("only returns the caller's own submissions", async () => {
    prismaMock.feedback.findMany.mockResolvedValue([]);

    await feedbackService.getMyFeedback(OWNER);

    expect(prismaMock.feedback.findMany.mock.calls[0][0].where).toEqual({ userId: OWNER });
  });
});

describe("getAllFeedback", () => {
  it("is not user-scoped — it backs the admin queue", async () => {
    prismaMock.feedback.findMany.mockResolvedValue([]);

    await feedbackService.getAllFeedback();

    expect(prismaMock.feedback.findMany.mock.calls[0][0].where).toBeUndefined();
  });
});

describe("deleteMyFeedback", () => {
  it("refuses to delete another user's submission", async () => {
    prismaMock.feedback.findFirst.mockResolvedValue(null);

    await expect(
      feedbackService.deleteMyFeedback("someone-else", "feedback-1"),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(prismaMock.feedback.delete).not.toHaveBeenCalled();
  });

  it("scopes the ownership lookup to the caller", async () => {
    prismaMock.feedback.findFirst.mockResolvedValue(storedFeedback());

    await feedbackService.deleteMyFeedback(OWNER, "feedback-1");

    expect(prismaMock.feedback.findFirst.mock.calls[0][0].where).toEqual({
      id: "feedback-1",
      userId: OWNER,
    });
  });
});

describe("updateFeedbackStatus", () => {
  beforeEach(() => {
    prismaMock.feedback.findUnique.mockResolvedValue(storedFeedback());
    prismaMock.feedback.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(storedFeedback(data)),
    );
  });

  it("accepts the kebab-case status the client sends", async () => {
    await feedbackService.updateFeedbackStatus("feedback-1", "in-review");

    expect(prismaMock.feedback.update.mock.calls[0][0].data.status).toBe("IN_REVIEW");
  });

  it("rejects an unknown status", async () => {
    await expect(
      feedbackService.updateFeedbackStatus("feedback-1", "wontfix"),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(prismaMock.feedback.update).not.toHaveBeenCalled();
  });

  it("404s on a submission that does not exist", async () => {
    prismaMock.feedback.findUnique.mockResolvedValue(null);

    await expect(
      feedbackService.updateFeedbackStatus("missing", "resolved"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("does not scope by user — an admin triages everyone's feedback", async () => {
    await feedbackService.updateFeedbackStatus("feedback-1", "resolved");

    expect(prismaMock.feedback.findUnique.mock.calls[0][0].where).toEqual({ id: "feedback-1" });
  });
});
