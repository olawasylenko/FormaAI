import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import {
  RequestAuthError,
  verifyRequestUser,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutItemId =
  | "standard"
  | "pro"
  | "credits_100"
  | "credits_250"
  | "credits_1000";

type CheckoutItem = {
  priceId: string;
  mode: "payment" | "subscription";
  purchaseType: "plan" | "credits";
  planId?: "standard" | "pro";
  bonusCredits?: number;
};

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Brak zmiennej środowiskowej: ${name}`
    );
  }

  return value;
}

function getCheckoutItems(): Record<
  CheckoutItemId,
  CheckoutItem
> {
  return {
    standard: {
      priceId: requiredEnvironmentVariable(
        "STRIPE_PRICE_STANDARD"
      ),
      mode: "subscription",
      purchaseType: "plan",
      planId: "standard",
    },

    pro: {
      priceId: requiredEnvironmentVariable(
        "STRIPE_PRICE_PRO"
      ),
      mode: "subscription",
      purchaseType: "plan",
      planId: "pro",
    },

    credits_100: {
      priceId: requiredEnvironmentVariable(
        "STRIPE_PRICE_CREDITS_100"
      ),
      mode: "payment",
      purchaseType: "credits",
      bonusCredits: 100,
    },

    credits_250: {
      priceId: requiredEnvironmentVariable(
        "STRIPE_PRICE_CREDITS_250"
      ),
      mode: "payment",
      purchaseType: "credits",
      bonusCredits: 250,
    },

    credits_1000: {
      priceId: requiredEnvironmentVariable(
        "STRIPE_PRICE_CREDITS_1000"
      ),
      mode: "payment",
      purchaseType: "credits",
      bonusCredits: 1000,
    },
  };
}

function isCheckoutItemId(
  value: unknown
): value is CheckoutItemId {
  return (
    value === "standard" ||
    value === "pro" ||
    value === "credits_100" ||
    value === "credits_250" ||
    value === "credits_1000"
  );
}

export async function POST(request: Request) {
  try {
    const user = await verifyRequestUser(request);
    const body = await request.json();
    const itemId = body?.itemId;

    if (!isCheckoutItemId(itemId)) {
      return NextResponse.json(
        {
          error:
            "Nieprawidłowy plan lub pakiet kredytów.",
        },
        { status: 400 }
      );
    }

    const checkoutItem = getCheckoutItems()[itemId];

    const metadata: Record<string, string> = {
      firebaseUid: user.uid,
      purchaseType: checkoutItem.purchaseType,
      checkoutItemId: itemId,
    };

    if (checkoutItem.planId) {
      metadata.planId = checkoutItem.planId;
    }

    if (checkoutItem.bonusCredits) {
      metadata.bonusCredits = String(
        checkoutItem.bonusCredits
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
      await stripe.checkout.sessions.create({
        mode: checkoutItem.mode,
        line_items: [
          {
            price: checkoutItem.priceId,
            quantity: 1,
          },
        ],
        client_reference_id: user.uid,
        customer_email: user.email,
        locale: "pl",
        metadata,

        success_url:
          `${appUrl}/dashboard?checkout=success` +
          "&session_id={CHECKOUT_SESSION_ID}",

        cancel_url:
          `${appUrl}/dashboard?checkout=cancelled`,

        ...(checkoutItem.mode === "subscription"
          ? {
              subscription_data: {
                metadata,
              },
            }
          : {
              payment_intent_data: {
                metadata,
              },
            }),
      });

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            "Stripe nie zwrócił adresu płatności.",
        },
        { status: 502 }
      );
    }

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
      "Błąd tworzenia Stripe Checkout:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się otworzyć formularza płatności.",
      },
      { status: 500 }
    );
  }
}
