import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  RequestAuthError,
  verifyRequestUser,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await verifyRequestUser(request);

    const snapshot = await adminDb
      .collection("creditAccounts")
      .doc(user.uid)
      .collection("transactions")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const items = snapshot.docs.map((document) => {
      const data = document.data();

      const metadata =
        data.metadata &&
        typeof data.metadata === "object"
          ? data.metadata
          : {};

      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : null;

      const type =
        data.type === "refund"
          ? "refund"
          : data.type === "purchase"
            ? "purchase"
            : "generation";

      return {
        id: document.id,
        type,
        amount:
          typeof data.amount === "number"
            ? data.amount
            : 0,
        monthlyUsed:
          typeof data.monthlyUsed === "number"
            ? data.monthlyUsed
            : 0,
        freeUsed:
          typeof data.freeUsed === "number"
            ? data.freeUsed
            : 0,
        bonusUsed:
          typeof data.bonusUsed === "number"
            ? data.bonusUsed
            : 0,
        balanceAfter:
          typeof data.balanceAfter === "number"
            ? data.balanceAfter
            : null,
        shouldTexture:
          typeof metadata.shouldTexture === "boolean"
            ? metadata.shouldTexture
            : null,
        purchaseType:
          typeof data.purchaseType === "string"
            ? data.purchaseType
            : null,
        reason:
          typeof data.reason === "string"
            ? data.reason
            : null,
        createdAt,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Błąd pobierania historii:", error);

    return NextResponse.json(
      {
        error: "Nie udało się pobrać historii kredytów.",
      },
      { status: 500 }
    );
  }
}
