import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getBootstrapAdminEmails, isBootstrapAdmin } from "./adminEmails";

const ORIGINAL = process.env.ADMIN_EMAILS;

beforeEach(() => {
  delete process.env.ADMIN_EMAILS;
});

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = ORIGINAL;
  }
});

describe("getBootstrapAdminEmails", () => {
  it("returns nothing when the variable is unset", () => {
    expect(getBootstrapAdminEmails()).toEqual([]);
  });

  it("returns nothing for an empty or whitespace-only value", () => {
    process.env.ADMIN_EMAILS = "   ";
    expect(getBootstrapAdminEmails()).toEqual([]);
  });

  it("parses a single address", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(getBootstrapAdminEmails()).toEqual(["founder@example.com"]);
  });

  it("splits a comma-separated list and trims the padding around each entry", () => {
    process.env.ADMIN_EMAILS = "one@example.com, two@example.com ,three@example.com";
    expect(getBootstrapAdminEmails()).toEqual([
      "one@example.com",
      "two@example.com",
      "three@example.com",
    ]);
  });

  it("lowercases so the stored casing cannot matter", () => {
    process.env.ADMIN_EMAILS = "Founder@Example.COM";
    expect(getBootstrapAdminEmails()).toEqual(["founder@example.com"]);
  });

  it("drops empty entries left by a trailing or doubled comma", () => {
    process.env.ADMIN_EMAILS = "one@example.com,,two@example.com,";
    expect(getBootstrapAdminEmails()).toEqual(["one@example.com", "two@example.com"]);
  });
});

describe("isBootstrapAdmin", () => {
  it("is false for every address when the list is unset", () => {
    expect(isBootstrapAdmin("founder@example.com")).toBe(false);
  });

  it("matches a listed address", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(isBootstrapAdmin("founder@example.com")).toBe(true);
  });

  it("does not match an unlisted address", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(isBootstrapAdmin("someone@example.com")).toBe(false);
  });

  it("matches regardless of the casing Firebase echoes back", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(isBootstrapAdmin("Founder@Example.com")).toBe(true);
  });

  it("matches an address surrounded by whitespace", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(isBootstrapAdmin("  founder@example.com  ")).toBe(true);
  });

  it("is false for an empty address even if the list has blank-ish entries", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(isBootstrapAdmin("")).toBe(false);
  });

  it("does not treat a substring of a listed address as a match", () => {
    process.env.ADMIN_EMAILS = "founder@example.com";
    expect(isBootstrapAdmin("founder@example.com.attacker.test")).toBe(false);
    expect(isBootstrapAdmin("ounder@example.com")).toBe(false);
  });
});
