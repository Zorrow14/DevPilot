import type { DecodedIdToken } from "firebase-admin/auth";

import { prisma } from "../lib/prisma";

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
    throw new Error("Firebase user email is required.");
  }

  return prisma.user.upsert({
    where: {
      firebaseUid: firebaseUser.firebaseUid,
    },
    update: {
      email: firebaseUser.email,
      name: firebaseUser.name ?? firebaseUser.email,
      imageUrl: firebaseUser.picture ?? null,
    },
    create: {
      firebaseUid: firebaseUser.firebaseUid,
      email: firebaseUser.email,
      name: firebaseUser.name ?? firebaseUser.email,
      imageUrl: firebaseUser.picture ?? null,
      role: "USER",
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
