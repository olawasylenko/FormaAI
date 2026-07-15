import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export type PlanId = "free" | "standard" | "pro";

export const PLAN_MONTHLY_CREDITS: Record<PlanId, number> = {
  free: 100,
  standard: 300,
  pro: 1000,
};

export interface CreditSummary {
  plan: PlanId;
  monthlyCredits: number;
  freeCredits: number;
  bonusCredits: number;
  totalCredits: number;
  monthlyAllowance: number;
  nextResetAt: string;
}

export interface ChargeResult {
  monthlyUsed: number;
  freeUsed: number;
  bonusUsed: number;
  remainingCredits: number;
  transactionId: string;
}

export class InsufficientCreditsError extends Error {
  availableCredits: number;
  requiredCredits: number;

  constructor(availableCredits: number, requiredCredits: number) {
    super("Masz za mało kredytów, aby wygenerować ten model.");
    this.name = "InsufficientCreditsError";
    this.availableCredits = availableCredits;
    this.requiredCredits = requiredCredits;
  }
}

function isPlanId(value: unknown): value is PlanId {
  return (
    value === "free" ||
    value === "standard" ||
    value === "pro"
  );
}

function addOneMonth(date: Date): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  result.setUTCDate(
    Math.min(originalDay, lastDayOfTargetMonth)
  );

  return result;
}

function numberOrDefault(
  value: unknown,
  defaultValue: number
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : defaultValue;
}

function resolveAccountState(
  data: FirebaseFirestore.DocumentData | undefined,
  now: Date
) {
  const plan: PlanId = isPlanId(data?.plan)
    ? data.plan
    : "free";

  const monthlyAllowance = PLAN_MONTHLY_CREDITS[plan];

  let monthlyCredits = numberOrDefault(
    data?.monthlyCredits,
    monthlyAllowance
  );

  const freeCredits = numberOrDefault(
    data?.freeCredits,
    0
  );

  const bonusCredits = numberOrDefault(
    data?.bonusCredits,
    0
  );

  let nextResetAt =
    data?.nextResetAt instanceof Timestamp
      ? data.nextResetAt.toDate()
      : addOneMonth(now);

  if (nextResetAt.getTime() <= now.getTime()) {
    monthlyCredits = monthlyAllowance;
    nextResetAt = addOneMonth(now);
  }

  return {
    plan,
    monthlyAllowance,
    monthlyCredits,
    freeCredits,
    bonusCredits,
    nextResetAt,
  };
}

function createSummary(
  state: ReturnType<typeof resolveAccountState>
): CreditSummary {
  return {
    plan: state.plan,
    monthlyCredits: state.monthlyCredits,
    freeCredits: state.freeCredits,
    bonusCredits: state.bonusCredits,
    totalCredits:
      state.monthlyCredits +
      state.freeCredits +
      state.bonusCredits,
    monthlyAllowance: state.monthlyAllowance,
    nextResetAt: state.nextResetAt.toISOString(),
  };
}

export async function getCreditSummary(
  uid: string
): Promise<CreditSummary> {
  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    const now = new Date();
    const nowTimestamp = Timestamp.fromDate(now);

    const state = resolveAccountState(
      snapshot.exists ? snapshot.data() : undefined,
      now
    );

    transaction.set(
      accountRef,
      {
        plan: state.plan,
        monthlyAllowance: state.monthlyAllowance,
        monthlyCredits: state.monthlyCredits,
        freeCredits: state.freeCredits,
        bonusCredits: state.bonusCredits,
        nextResetAt: Timestamp.fromDate(state.nextResetAt),
        updatedAt: nowTimestamp,
        ...(snapshot.exists
          ? {}
          : {
              createdAt: nowTimestamp,
            }),
      },
      {
        merge: true,
      }
    );

    return createSummary(state);
  });
}

export async function chargeCredits(
  uid: string,
  cost: number,
  metadata: Record<string, unknown>
): Promise<ChargeResult> {
  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  const historyRef = accountRef
    .collection("transactions")
    .doc();

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    const now = new Date();
    const nowTimestamp = Timestamp.fromDate(now);

    const state = resolveAccountState(
      snapshot.exists ? snapshot.data() : undefined,
      now
    );

    const availableCredits =
      state.monthlyCredits +
      state.freeCredits +
      state.bonusCredits;

    if (availableCredits < cost) {
      throw new InsufficientCreditsError(
        availableCredits,
        cost
      );
    }

    const monthlyUsed = Math.min(
      state.monthlyCredits,
      cost
    );

    const afterMonthly = cost - monthlyUsed;

    const freeUsed = Math.min(
      state.freeCredits,
      afterMonthly
    );

    const bonusUsed = afterMonthly - freeUsed;

    const monthlyCredits =
      state.monthlyCredits - monthlyUsed;

    const freeCredits =
      state.freeCredits - freeUsed;

    const bonusCredits =
      state.bonusCredits - bonusUsed;

    const remainingCredits =
      monthlyCredits + freeCredits + bonusCredits;

    transaction.set(
      accountRef,
      {
        plan: state.plan,
        monthlyAllowance: state.monthlyAllowance,
        monthlyCredits,
        freeCredits,
        bonusCredits,
        nextResetAt: Timestamp.fromDate(state.nextResetAt),
        updatedAt: nowTimestamp,
        ...(snapshot.exists
          ? {}
          : {
              createdAt: nowTimestamp,
            }),
      },
      {
        merge: true,
      }
    );

    transaction.set(historyRef, {
      type: "generation",
      amount: -cost,
      monthlyUsed,
      freeUsed,
      bonusUsed,
      balanceAfter: remainingCredits,
      metadata,
      createdAt: nowTimestamp,
    });

    return {
      monthlyUsed,
      freeUsed,
      bonusUsed,
      remainingCredits,
      transactionId: historyRef.id,
    };
  });
}

export async function refundCharge(
  uid: string,
  charge: ChargeResult,
  reason: string
): Promise<void> {
  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  const historyRef = accountRef
    .collection("transactions")
    .doc();

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    const now = new Date();
    const nowTimestamp = Timestamp.fromDate(now);

    const state = resolveAccountState(
      snapshot.exists ? snapshot.data() : undefined,
      now
    );

    const proposedMonthlyCredits =
      state.monthlyCredits + charge.monthlyUsed;

    const monthlyCredits = Math.min(
      state.monthlyAllowance,
      proposedMonthlyCredits
    );

    const monthlyOverflow = Math.max(
      0,
      proposedMonthlyCredits - state.monthlyAllowance
    );

    const freeCredits =
      state.freeCredits +
      charge.freeUsed +
      monthlyOverflow;

    const bonusCredits =
      state.bonusCredits + charge.bonusUsed;

    transaction.set(
      accountRef,
      {
        plan: state.plan,
        monthlyAllowance: state.monthlyAllowance,
        monthlyCredits,
        freeCredits,
        bonusCredits,
        nextResetAt: Timestamp.fromDate(state.nextResetAt),
        updatedAt: nowTimestamp,
      },
      {
        merge: true,
      }
    );

    transaction.set(historyRef, {
      type: "refund",
      amount:
        charge.monthlyUsed +
        charge.freeUsed +
        charge.bonusUsed,
      relatedTransactionId: charge.transactionId,
      reason,
      balanceAfter:
        monthlyCredits + freeCredits + bonusCredits,
      createdAt: nowTimestamp,
    });
  });
}

export async function registerGenerationTask(
  taskId: string,
  uid: string,
  charge: ChargeResult,
  shouldTexture: boolean,
  cost: number
): Promise<void> {
  const now = Timestamp.now();

  await adminDb
    .collection("generationTasks")
    .doc(taskId)
    .set({
      uid,
      status: "PENDING",
      cost,
      monthlyUsed: charge.monthlyUsed,
      freeUsed: charge.freeUsed,
      bonusUsed: charge.bonusUsed,
      creditTransactionId: charge.transactionId,
      shouldTexture,
      refunded: false,
      createdAt: now,
      updatedAt: now,
    });
}

export async function markGenerationSucceeded(
  taskId: string,
  uid: string
): Promise<void> {
  const taskRef = adminDb
    .collection("generationTasks")
    .doc(taskId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(taskRef);

    if (!snapshot.exists) return;

    const data = snapshot.data();

    if (data?.uid !== uid) {
      throw new Error("Brak dostępu do zadania.");
    }

    if (data?.status === "SUCCEEDED") return;

    transaction.update(taskRef, {
      status: "SUCCEEDED",
      updatedAt: Timestamp.now(),
    });
  });
}

export async function refundFailedGenerationTask(
  taskId: string,
  uid: string,
  reason: string
): Promise<boolean> {
  const taskRef = adminDb
    .collection("generationTasks")
    .doc(taskId);

  const accountRef = adminDb
    .collection("creditAccounts")
    .doc(uid);

  const historyRef = accountRef
    .collection("transactions")
    .doc();

  return adminDb.runTransaction(
    async (transaction) => {
      const taskSnapshot = await transaction.get(taskRef);
      const accountSnapshot =
        await transaction.get(accountRef);

      if (!taskSnapshot.exists) return false;

      const taskData = taskSnapshot.data();

      if (taskData?.uid !== uid) {
        throw new Error("Brak dostępu do zadania.");
      }

      if (taskData?.refunded === true) {
        return false;
      }

      const monthlyUsed = numberOrDefault(
        taskData?.monthlyUsed,
        0
      );

      const freeUsed = numberOrDefault(
        taskData?.freeUsed,
        0
      );

      const bonusUsed = numberOrDefault(
        taskData?.bonusUsed,
        0
      );

      const now = new Date();
      const nowTimestamp = Timestamp.fromDate(now);

      const state = resolveAccountState(
        accountSnapshot.exists
          ? accountSnapshot.data()
          : undefined,
        now
      );

      const proposedMonthlyCredits =
        state.monthlyCredits + monthlyUsed;

      const monthlyCredits = Math.min(
        state.monthlyAllowance,
        proposedMonthlyCredits
      );

      const monthlyOverflow = Math.max(
        0,
        proposedMonthlyCredits -
          state.monthlyAllowance
      );

      const freeCredits =
        state.freeCredits +
        freeUsed +
        monthlyOverflow;

      const bonusCredits =
        state.bonusCredits + bonusUsed;

      transaction.set(
        accountRef,
        {
          plan: state.plan,
          monthlyAllowance: state.monthlyAllowance,
          monthlyCredits,
          freeCredits,
          bonusCredits,
          nextResetAt: Timestamp.fromDate(state.nextResetAt),
          updatedAt: nowTimestamp,
        },
        {
          merge: true,
        }
      );

      transaction.update(taskRef, {
        status: "FAILED",
        refunded: true,
        failureReason: reason,
        updatedAt: nowTimestamp,
      });

      transaction.set(historyRef, {
        type: "refund",
        amount:
          monthlyUsed + freeUsed + bonusUsed,
        relatedTaskId: taskId,
        relatedTransactionId:
          taskData?.creditTransactionId ?? null,
        reason,
        balanceAfter:
          monthlyCredits + freeCredits + bonusCredits,
        createdAt: nowTimestamp,
      });

      return true;
    }
  );
}
