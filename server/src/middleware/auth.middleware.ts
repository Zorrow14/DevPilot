import type { NextFunction, Request, Response } from "express";

import { getFirebaseAuth } from "../config/firebaseAdmin";
import { getFirebaseUserInfo, syncFirebaseUser } from "../services/auth.service";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing authorization token." });
    return;
  }

  const token = authorizationHeader.slice("Bearer ".length);

  try {
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    const firebaseUser = getFirebaseUserInfo(decodedToken);
    const dbUser = await syncFirebaseUser(firebaseUser);

    req.user = {
      dbUserId: dbUser.id,
      firebaseUid: dbUser.firebaseUid,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.imageUrl ?? undefined,
      role: dbUser.role,
      status: dbUser.status,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired authorization token." });
  }
}
