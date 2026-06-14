import { prisma } from "../lib/prisma";

const TEMPORARY_USER = {
  firebaseUid: "temporary-dev-user",
  email: "devpilot.test@example.com",
  name: "DevPilot Test User",
};

export async function getTemporaryUser() {
  return prisma.user.upsert({
    where: {
      firebaseUid: TEMPORARY_USER.firebaseUid,
    },
    update: {
      email: TEMPORARY_USER.email,
      name: TEMPORARY_USER.name,
    },
    create: TEMPORARY_USER,
  });
}
