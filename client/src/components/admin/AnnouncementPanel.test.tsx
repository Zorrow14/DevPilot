import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnnouncementPanel } from "./AnnouncementPanel";
import type { Announcement } from "@/src/types";

const createAnnouncement = vi.fn();
const updateAnnouncement = vi.fn();
const deleteAnnouncement = vi.fn();

vi.mock("@/src/lib/api", () => ({
  api: {
    createAnnouncement: (...args: unknown[]) => createAnnouncement(...args),
    updateAnnouncement: (...args: unknown[]) => updateAnnouncement(...args),
    deleteAnnouncement: (...args: unknown[]) => deleteAnnouncement(...args),
  },
}));

function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  return {
    id: "announcement-1",
    title: "Scheduled maintenance",
    message: "Briefly unavailable on Saturday.",
    createdById: "admin-1",
    createdByName: "Grace",
    createdAt: "2026-08-25",
    updatedAt: "2026-08-25",
    ...overrides,
  };
}

beforeEach(() => {
  createAnnouncement.mockResolvedValue(undefined);
  updateAnnouncement.mockResolvedValue(undefined);
  deleteAnnouncement.mockResolvedValue(undefined);
});

describe("AnnouncementPanel", () => {
  it("creates a new announcement when nothing is being edited", async () => {
    render(<AnnouncementPanel announcements={[]} onChanged={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("Title"), "Downtime");
    await userEvent.type(screen.getByLabelText("Message"), "Sunday 2am.");
    await userEvent.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => {
      expect(createAnnouncement).toHaveBeenCalledWith({
        title: "Downtime",
        message: "Sunday 2am.",
      });
    });
    expect(updateAnnouncement).not.toHaveBeenCalled();
  });

  it("switches to updating the selected announcement once Edit is clicked", async () => {
    render(<AnnouncementPanel announcements={[makeAnnouncement()]} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateAnnouncement).toHaveBeenCalledWith("announcement-1", {
        title: "Scheduled maintenance",
        message: "Briefly unavailable on Saturday.",
      });
    });
    expect(createAnnouncement).not.toHaveBeenCalled();
  });

  it("loads the announcement into the form when editing starts", async () => {
    render(<AnnouncementPanel announcements={[makeAnnouncement()]} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByLabelText("Title")).toHaveValue("Scheduled maintenance");
  });

  it("returns to create mode when editing is cancelled", async () => {
    render(<AnnouncementPanel announcements={[makeAnnouncement()]} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
  });

  it("leaves edit mode when the announcement being edited is deleted", async () => {
    // Otherwise the form would keep pointing at a row that no longer exists and
    // the next save would 404.
    render(<AnnouncementPanel announcements={[makeAnnouncement()]} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
    });
  });

  it("surfaces a save failure instead of clearing the form", async () => {
    createAnnouncement.mockRejectedValue(new Error("Announcement title is required."));
    const onChanged = vi.fn();
    render(<AnnouncementPanel announcements={[]} onChanged={onChanged} />);

    await userEvent.type(screen.getByLabelText("Title"), "T");
    await userEvent.type(screen.getByLabelText("Message"), "M");
    await userEvent.click(screen.getByRole("button", { name: /publish/i }));

    expect(await screen.findByText("Announcement title is required.")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("T");
    expect(onChanged).not.toHaveBeenCalled();
  });
});
