import type { DecodedIdToken } from "firebase-admin/auth";

import { isBootstrapAdmin } from "../config/adminEmails";
import { prisma } from "../lib/prisma";
import { ValidationError } from "../utils/errors";

export type FirebaseUserInfo = {
  firebaseUid: string;
  email: string;
  name?: string;
  picture?: string;
};

export function getFirebaseUserInfo(decodedToken: DecodedIdToken): FirebaseUserInfo {
  return {
    firebaseUid: decodedToken.uid,
    email: decodedToken.email ?? "",
    name: decodedToken.name,
    picture: decodedToken.picture,
  };
}

export async function syncFirebaseUser(firebaseUser: FirebaseUserInfo) {
  if (!firebaseUser.email) {
    throw new ValidationError("Firebase user email is required.");
  }

  // Reconciled on every sync rather than only at create, so adding an address
  // to ADMIN_EMAILS promotes someone who had already signed up.
  const shouldBootstrapAdmin = isBootstrapAdmin(firebaseUser.email);

  return prisma.user.upsert({
    where: {
      firebaseUid: firebaseUser.firebaseUid,
    },
    update: {
      email: firebaseUser.email,
      name: firebaseUser.name ?? firebaseUser.email,
      imageUrl: firebaseUser.picture ?? null,
      // Promote-only. Writing `role` unconditionally here would mean a USER
      // promoted through the admin screens is reverted on their very next
      // request, and an admin removed from the env list is demoted mid-session.
      // The list is a floor on who is an admin, not the source of truth.
      ...(shouldBootstrapAdmin ? { role: "ADMIN" as const } : {}),
    },
    create: {
      firebaseUid: firebaseUser.firebaseUid,
      email: firebaseUser.email,
      name: firebaseUser.name ?? firebaseUser.email,
      imageUrl: firebaseUser.picture ?? null,
      role: shouldBootstrapAdmin ? "ADMIN" : "USER",
      status: "ACTIVE",
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
}
