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

    // Deactivation is enforced here rather than at each route: the token stays
    // valid in Firebase, so Postgres status is the only thing that can lock a
    // suspended account out. Returned before req.user is populated so no
    // downstream handler can act on a deactivated identity.
    if (dbUser.status === "INACTIVE") {
      res.status(403).json({ message: "This account has been deactivated." });
      return;
    }

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
