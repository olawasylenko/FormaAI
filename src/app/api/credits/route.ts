import { NextResponse } from "next/server";
import {
  getCreditSummary,
} from "@/lib/credits";
import {
  RequestAuthError,
  verifyRequestUser,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await verifyRequestUser(request);
    const summary = await getCreditSummary(user.uid);

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Błąd pobierania kredytów:", error);

    return NextResponse.json(
      { error: "Nie udało się pobrać salda kredytów." },
      { status: 500 }
    );
  }
}
