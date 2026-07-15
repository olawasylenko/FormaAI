import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebase-admin";

export class RequestAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "RequestAuthError";
    this.status = status;
  }
}

export async function verifyRequestUser(
  request: Request
): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new RequestAuthError("Musisz być zalogowana.", 401);
  }

  const idToken = authorization.slice("Bearer ".length).trim();

  if (!idToken) {
    throw new RequestAuthError("Brak tokenu logowania.", 401);
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      throw new RequestAuthError(
        "Najpierw potwierdź swój adres e-mail.",
        403
      );
    }

    return decodedToken;
  } catch (error) {
    if (error instanceof RequestAuthError) {
      throw error;
    }

    throw new RequestAuthError(
      "Sesja wygasła. Zaloguj się ponownie.",
      401
    );
  }
}
