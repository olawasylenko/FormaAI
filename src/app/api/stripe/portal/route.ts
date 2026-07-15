import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  RequestAuthError,
  verifyRequestUser,
} from "@/lib/server-auth";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getObjectId(
  value:
    | string
    | { id: string }
    | null
    | undefined
): string | null {
  if (typeof value === "string") {
    return value;
  }

  return value?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const user = await verifyRequestUser(request);

    const accountRef = adminDb
      .collection("creditAccounts")
      .doc(user.uid);

    const accountSnapshot = await accountRef.get();
    const accountData = accountSnapshot.data();

    let stripeCustomerId =
      typeof accountData?.stripeCustomerId === "string"
        ? accountData.stripeCustomerId
        : "";

    const stripeSubscriptionId =
      typeof accountData?.stripeSubscriptionId === "string"
        ? accountData.stripeSubscriptionId
        : "";

    /*
     * Starsze płatności mogły zapisać subskrypcję,
     * ale nie identyfikator klienta Stripe.
     * Odzyskujemy klienta z istniejącej subskrypcji.
     */
    if (
      !stripeCustomerId.startsWith("cus_") &&
      stripeSubscriptionId.startsWith("sub_")
    ) {
      const subscription =
        await stripe.subscriptions.retrieve(
          stripeSubscriptionId
        );

      stripeCustomerId =
        getObjectId(subscription.customer) ?? "";

      if (stripeCustomerId.startsWith("cus_")) {
        await accountRef.set(
          {
            stripeCustomerId,
            updatedAt: FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          }
        );
      }
    }

    if (!stripeCustomerId.startsWith("cus_")) {
      return NextResponse.json(
        {
          error:
            "Nie udało się odnaleźć konta płatniczego Stripe. Odśwież stronę i spróbuj ponownie.",
        },
        { status: 400 }
      );
    }

    const configuredAppUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(
        /\/+$/,
        ""
      );

    const requestOrigin = new URL(request.url).origin;
    const appUrl = configuredAppUrl || requestOrigin;

    const session =
      await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url:
          `${appUrl}/dashboard?portal=return`,
      });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(
      "Błąd otwierania Portalu klienta Stripe:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się otworzyć zarządzania subskrypcją.",
      },
      { status: 500 }
    );
  }
}
