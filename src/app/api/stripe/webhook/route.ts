import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import {
  activateStripePlan,
  cancelStripeSubscription,
  grantPurchasedCredits,
  syncStripeSubscription,
} from "@/lib/stripe-fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requiredWebhookSecret() {
  const value =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!value) {
    throw new Error(
      "Brak zmiennej STRIPE_WEBHOOK_SECRET."
    );
  }

  return value;
}

function objectId(
  value:
    | string
    | { id: string }
    | null
    | undefined
) {
  if (typeof value === "string") {
    return value;
  }

  return value?.id ?? null;
}

async function handleCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata ?? {};
  const uid = metadata.firebaseUid;
  const purchaseType =
    metadata.purchaseType;

  if (!uid || !purchaseType) {
    throw new Error(
      "Sesja Stripe nie zawiera danych użytkownika."
    );
  }

  if (purchaseType === "credits") {
    if (
      session.payment_status !== "paid" &&
      event.type !==
        "checkout.session.async_payment_succeeded"
    ) {
      return;
    }

    const credits = Number(
      metadata.bonusCredits
    );

    await grantPurchasedCredits({
      eventId: event.id,
      uid,
      credits,
      checkoutSessionId: session.id,
      stripeCustomerId: objectId(
        session.customer
      ),
    });

    return;
  }

  if (purchaseType === "plan") {
    const planId = metadata.planId;

    if (
      planId !== "standard" &&
      planId !== "pro"
    ) {
      throw new Error(
        "Nieprawidłowy plan w sesji Stripe."
      );
    }

    const subscriptionId = objectId(
      session.subscription
    );

    if (!subscriptionId) {
      throw new Error(
        "Stripe nie zwrócił subskrypcji."
      );
    }

    const subscription =
      await stripe.subscriptions.retrieve(
        subscriptionId
      );

    await activateStripePlan({
      eventId: event.id,
      uid,
      plan: planId,
      subscription,
      checkoutSessionId: session.id,
    });
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      { error: "Brak podpisu Stripe." },
      { status: 400 }
    );
  }

  try {
    const payload = await request.text();

    const event =
      stripe.webhooks.constructEvent(
        payload,
        signature,
        requiredWebhookSecret()
      );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await handleCheckoutSession(
          event,
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "customer.subscription.updated": {
        await syncStripeSubscription({
          eventId: event.id,
          subscription:
            event.data.object as Stripe.Subscription,
        });
        break;
      }

      case "customer.subscription.deleted": {
        await cancelStripeSubscription({
          eventId: event.id,
          subscription:
            event.data.object as Stripe.Subscription,
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Błąd webhooka Stripe:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się obsłużyć zdarzenia Stripe.",
      },
      { status: 400 }
    );
  }
}
