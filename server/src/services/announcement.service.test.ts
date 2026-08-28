import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  announcement: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));

const announcementService = await import("./announcement.service");
const { NotFoundError, ValidationError } = await import("../utils/errors");

const ADMIN = "admin-user-id";

function storedAnnouncement(overrides: Record<string, unknown> = {}) {
  return {
    id: "announcement-1",
    title: "Scheduled maintenance",
    message: "DevPilot will be briefly unavailable on Saturday.",
    createdById: ADMIN,
    createdAt: new Date("2026-08-25T08:00:00.000Z"),
    updatedAt: new Date("2026-08-25T08:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.announcement.create.mockImplementation(
    ({ data }: { data: Record<string, unknown> }) => Promise.resolve(storedAnnouncement(data)),
  );
  prismaMock.announcement.update.mockImplementation(
    ({ data }: { data: Record<string, unknown> }) => Promise.resolve(storedAnnouncement(data)),
  );
  prismaMock.announcement.findUnique.mockResolvedValue(storedAnnouncement());
});

describe("getAnnouncements", () => {
  it("is not user-scoped — announcements are platform-wide", async () => {
    prismaMock.announcement.findMany.mockResolvedValue([]);

    await announcementService.getAnnouncements();

    expect(prismaMock.announcement.findMany.mock.calls[0][0].where).toBeUndefined();
  });

  it("returns the newest first", async () => {
    prismaMock.announcement.findMany.mockResolvedValue([]);

    await announcementService.getAnnouncements();

    expect(prismaMock.announcement.findMany.mock.calls[0][0].orderBy).toEqual({
      createdAt: "desc",
    });
  });

  it("serializes dates date-only and names the author", async () => {
    prismaMock.announcement.findMany.mockResolvedValue([
      { ...storedAnnouncement(), createdBy: { id: ADMIN, name: "Grace" } },
    ]);

    const [item] = await announcementService.getAnnouncements();

    expect(item.createdAt).toBe("2026-08-25");
    expect(item.createdByName).toBe("Grace");
  });

  it("renders a missing author as an empty string, not undefined", async () => {
    prismaMock.announcement.findMany.mockResolvedValue([storedAnnouncement()]);

    const [item] = await announcementService.getAnnouncements();

    expect(item.createdByName).toBe("");
  });
});

describe("createAnnouncement", () => {
  it("records the publishing admin as the author", async () => {
    await announcementService.createAnnouncement(ADMIN, { title: "T", message: "M" });

    expect(prismaMock.announcement.create.mock.calls[0][0].data.createdById).toBe(ADMIN);
  });

  it("rejects a post with no message", async () => {
    await expect(
      announcementService.createAnnouncement(ADMIN, { title: "T" }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });
});

describe("updateAnnouncement", () => {
  it("lets any admin edit, not only the original author", async () => {
    // Authority comes from requireAdmin on the route, not from authorship —
    // otherwise a typo would be uncorrectable once its author left.
    prismaMock.announcement.findUnique.mockResolvedValue(
      storedAnnouncement({ createdById: "a-different-admin" }),
    );

    await expect(
      announcementService.updateAnnouncement("announcement-1", { title: "Fixed" }),
    ).resolves.toBeDefined();
  });

  it("404s on an announcement that does not exist", async () => {
    prismaMock.announcement.findUnique.mockResolvedValue(null);

    await expect(
      announcementService.updateAnnouncement("missing", { title: "T" }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(prismaMock.announcement.update).not.toHaveBeenCalled();
  });

  it("leaves omitted fields untouched", async () => {
    await announcementService.updateAnnouncement("announcement-1", { title: "New title" });

    expect(prismaMock.announcement.update.mock.calls[0][0].data.message).toBeUndefined();
  });
});

describe("deleteAnnouncement", () => {
  it("404s rather than silently succeeding on a missing row", async () => {
    prismaMock.announcement.findUnique.mockResolvedValue(null);

    await expect(announcementService.deleteAnnouncement("missing")).rejects.toBeInstanceOf(
      NotFoundError,
    );

    expect(prismaMock.announcement.delete).not.toHaveBeenCalled();
  });
});
