import type Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  PLAN_MONTHLY_CREDITS,
  type PlanId,
} from "@/lib/credits";

type PaidPlanId = "standard" | "pro";

function isPlanId(value: unknown): value is PlanId {
  return (
    value === "free" ||
    value === "standard" ||
    value === "pro"
  );
}

function isPaidPlanId(
  value: unknown
): value is PaidPlanId {
  return value === "standard" || value === "pro";
}

function numberOrDefault(
  value: unknown,
  defaultValue: number
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : defaultValue;
}

function addOneMonth(date: Date) {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  result.setUTCDate(
    Math.min(originalDay, lastDay)
  );

  return result;
}

function getStripeObjectId(
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

function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
) {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isFinite(value)
    );

  if (periodEnds.length === 0) {
    return addOneMonth(new Date());
  }

  return new Date(
    Math.max(...periodEnds) * 1000
  );
}

export async function grantPurchasedCredits({
  eventId,
  uid,
  credits,
  checkoutSessionId,
  stripeCustomerId,
}: {
  eventId: string;
  uid: string;
  credits: number;
  checkoutSessionId: string;
  stripeCustomerId: string | null;
}) {
  if (![100, 250, 1000].includes(credits)) {
    throw new Error(
      "Nieprawidłowa liczba zakupionych kredytów."
    );
  }

  const eventRef = adminDb
    .collection("stripeWebhookEvents")
    .doc(eventId);

  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  const historyRef = accountRef
    .collection("transactions")
    .doc();

  return adminDb.runTransaction(
    async (transaction) => {
      const eventSnapshot =
        await transaction.get(eventRef);

      if (eventSnapshot.exists) {
        return false;
      }

      const accountSnapshot =
        await transaction.get(accountRef);

      const data = accountSnapshot.exists
        ? accountSnapshot.data()
        : undefined;

      const plan: PlanId = isPlanId(data?.plan)
        ? data.plan
        : "free";

      const allowance =
        PLAN_MONTHLY_CREDITS[plan];

      const monthlyCredits = numberOrDefault(
        data?.monthlyCredits,
        allowance
      );

      const freeCredits = numberOrDefault(
        data?.freeCredits,
        0
      );

      const currentBonusCredits =
        numberOrDefault(
          data?.bonusCredits,
          0
        );

      const bonusCredits =
        currentBonusCredits + credits;

      const now = new Date();
      const nowTimestamp =
        Timestamp.fromDate(now);

      const nextResetAt =
        data?.nextResetAt instanceof Timestamp
          ? data.nextResetAt
          : Timestamp.fromDate(
              addOneMonth(now)
            );

      transaction.set(
        accountRef,
        {
          plan,
          monthlyAllowance: allowance,
          monthlyCredits,
          freeCredits,
          bonusCredits,
          nextResetAt,
          stripeCustomerId,
          updatedAt: nowTimestamp,
          ...(accountSnapshot.exists
            ? {}
            : {
                createdAt: nowTimestamp,
              }),
        },
        { merge: true }
      );

      transaction.set(historyRef, {
        type: "purchase",
        amount: credits,
        balanceAfter:
          monthlyCredits + bonusCredits,
        purchaseType: "credits",
        checkoutSessionId,
        stripeEventId: eventId,
        createdAt: nowTimestamp,
      });

      transaction.set(eventRef, {
        type: "credits_purchase",
        uid,
        checkoutSessionId,
        processedAt: nowTimestamp,
      });

      return true;
    }
  );
}

export async function activateStripePlan({
  eventId,
  uid,
  plan,
  subscription,
  checkoutSessionId,
}: {
  eventId: string;
  uid: string;
  plan: PaidPlanId;
  subscription: Stripe.Subscription;
  checkoutSessionId: string;
}) {
  const eventRef = adminDb
    .collection("stripeWebhookEvents")
    .doc(eventId);

  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  return adminDb.runTransaction(
    async (transaction) => {
      const eventSnapshot =
        await transaction.get(eventRef);

      if (eventSnapshot.exists) {
        return false;
      }

      const accountSnapshot =
        await transaction.get(accountRef);

      const data = accountSnapshot.exists
        ? accountSnapshot.data()
        : undefined;

      const previousPlan: PlanId =
        isPlanId(data?.plan)
          ? data.plan
          : "free";

      const previousAllowance =
        PLAN_MONTHLY_CREDITS[previousPlan];

      const previousMonthlyCredits =
        numberOrDefault(
          data?.monthlyCredits,
          previousAllowance
        );

      const existingFreeCredits =
        numberOrDefault(
          data?.freeCredits,
          0
        );

      const freeCredits =
        previousPlan === "free"
          ? existingFreeCredits +
            previousMonthlyCredits
          : existingFreeCredits;

      const allowance =
        PLAN_MONTHLY_CREDITS[plan];

      const bonusCredits = numberOrDefault(
        data?.bonusCredits,
        0
      );

      const nowTimestamp = Timestamp.now();

      transaction.set(
        accountRef,
        {
          plan,
          monthlyAllowance: allowance,
          monthlyCredits: allowance,
          freeCredits,
          bonusCredits,
          nextResetAt: Timestamp.fromDate(
            getSubscriptionPeriodEnd(
              subscription
            )
          ),
          stripeCustomerId:
            getStripeObjectId(
              subscription.customer
            ),
          stripeSubscriptionId:
            subscription.id,
          stripeSubscriptionStatus:
            subscription.status,
          stripeCancelAtPeriodEnd:
            subscription.cancel_at_period_end,
          updatedAt: nowTimestamp,
          ...(accountSnapshot.exists
            ? {}
            : {
                createdAt: nowTimestamp,
              }),
        },
        { merge: true }
      );

      transaction.set(eventRef, {
        type: "plan_activation",
        uid,
        plan,
        checkoutSessionId,
        stripeSubscriptionId:
          subscription.id,
        processedAt: nowTimestamp,
      });

      return true;
    }
  );
}

export async function syncStripeSubscription({
  eventId,
  subscription,
}: {
  eventId: string;
  subscription: Stripe.Subscription;
}) {
  const uid =
    subscription.metadata.firebaseUid;

  const planValue =
    subscription.metadata.planId;

  if (!uid || !isPaidPlanId(planValue)) {
    return false;
  }

  const plan = planValue;

  const eventRef = adminDb
    .collection("stripeWebhookEvents")
    .doc(eventId);

  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  return adminDb.runTransaction(
    async (transaction) => {
      const eventSnapshot =
        await transaction.get(eventRef);

      if (eventSnapshot.exists) {
        return false;
      }

      const accountSnapshot =
        await transaction.get(accountRef);

      const data = accountSnapshot.exists
        ? accountSnapshot.data()
        : undefined;

      const previousPlan: PlanId =
        isPlanId(data?.plan)
          ? data.plan
          : "free";

      const allowance =
        PLAN_MONTHLY_CREDITS[plan];

      const previousAllowance =
        PLAN_MONTHLY_CREDITS[previousPlan];

      const previousMonthlyCredits =
        numberOrDefault(
          data?.monthlyCredits,
          previousAllowance
        );

      const existingFreeCredits =
        numberOrDefault(
          data?.freeCredits,
          0
        );

      const freeCredits =
        previousPlan === "free"
          ? existingFreeCredits +
            previousMonthlyCredits
          : existingFreeCredits;

      const monthlyCredits =
        previousPlan === plan
          ? previousMonthlyCredits
          : allowance;

      const bonusCredits = numberOrDefault(
        data?.bonusCredits,
        0
      );

      const nowTimestamp = Timestamp.now();

      transaction.set(
        accountRef,
        {
          plan,
          monthlyAllowance: allowance,
          monthlyCredits,
          freeCredits,
          bonusCredits,
          nextResetAt: Timestamp.fromDate(
            getSubscriptionPeriodEnd(
              subscription
            )
          ),
          stripeCustomerId:
            getStripeObjectId(
              subscription.customer
            ),
          stripeSubscriptionId:
            subscription.id,
          stripeSubscriptionStatus:
            subscription.status,
          stripeCancelAtPeriodEnd:
            subscription.cancel_at_period_end,
          updatedAt: nowTimestamp,
          ...(accountSnapshot.exists
            ? {}
            : {
                createdAt: nowTimestamp,
              }),
        },
        { merge: true }
      );

      transaction.set(eventRef, {
        type: "subscription_update",
        uid,
        plan,
        stripeSubscriptionId:
          subscription.id,
        processedAt: nowTimestamp,
      });

      return true;
    }
  );
}

export async function cancelStripeSubscription({
  eventId,
  subscription,
}: {
  eventId: string;
  subscription: Stripe.Subscription;
}) {
  const uid =
    subscription.metadata.firebaseUid;

  if (!uid) {
    return false;
  }

  const eventRef = adminDb
    .collection("stripeWebhookEvents")
    .doc(eventId);

  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  return adminDb.runTransaction(
    async (transaction) => {
      const eventSnapshot =
        await transaction.get(eventRef);

      if (eventSnapshot.exists) {
        return false;
      }

      const accountSnapshot =
        await transaction.get(accountRef);

      const data = accountSnapshot.exists
        ? accountSnapshot.data()
        : undefined;

      const freeCredits = numberOrDefault(
        data?.freeCredits,
        0
      );

      const bonusCredits = numberOrDefault(
        data?.bonusCredits,
        0
      );

      const now = new Date();
      const nowTimestamp =
        Timestamp.fromDate(now);

      transaction.set(
        accountRef,
        {
          plan: "free",
          monthlyAllowance:
            PLAN_MONTHLY_CREDITS.free,
          monthlyCredits:
            PLAN_MONTHLY_CREDITS.free,
          freeCredits,
          bonusCredits,
          nextResetAt: Timestamp.fromDate(
            addOneMonth(now)
          ),
          stripeSubscriptionStatus:
            "canceled",
          stripeCancelAtPeriodEnd: false,
          updatedAt: nowTimestamp,
          ...(accountSnapshot.exists
            ? {}
            : {
                createdAt: nowTimestamp,
              }),
        },
        { merge: true }
      );

      transaction.set(eventRef, {
        type: "subscription_deleted",
        uid,
        stripeSubscriptionId:
          subscription.id,
        processedAt: nowTimestamp,
      });

      return true;
    }
  );
}
