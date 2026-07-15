import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  markGenerationSucceeded,
  refundFailedGenerationTask,
} from "@/lib/credits";
import {
  RequestAuthError,
  verifyRequestUser,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await verifyRequestUser(request);
    const apiKey = process.env.MESHY_API_KEY;
    const { id } = await params;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak konfiguracji generatora." },
        { status: 500 }
      );
    }

    const taskSnapshot = await adminDb
      .collection("generationTasks")
      .doc(id)
      .get();

    if (!taskSnapshot.exists) {
      return NextResponse.json(
        { error: "Nie znaleziono zadania." },
        { status: 404 }
      );
    }

    if (taskSnapshot.data()?.uid !== user.uid) {
      return NextResponse.json(
        { error: "Brak dostępu do zadania." },
        { status: 403 }
      );
    }

    const response = await fetch(
      `https://api.meshy.ai/openapi/v1/image-to-3d/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.task_error?.message ||
            "Nie udało się pobrać statusu zadania.",
        },
        { status: response.status }
      );
    }

    const taskError =
      typeof data?.task_error === "string"
        ? data.task_error
        : data?.task_error?.message || null;

    let creditsRefunded = false;

    if (data?.status === "FAILED") {
      creditsRefunded =
        await refundFailedGenerationTask(
          id,
          user.uid,
          taskError ||
            "Generowanie modelu nie powiodło się."
        );
    }

    if (data?.status === "SUCCEEDED") {
      await markGenerationSucceeded(
        id,
        user.uid
      );
    }

    return NextResponse.json({
      id: data?.id ?? id,
      status: data?.status ?? "",
      progress: data?.progress ?? 0,
      thumbnailUrl:
        data?.thumbnail_url ?? null,
      modelUrls:
        data?.model_urls ?? null,
      taskError,
      creditsRefunded,
    });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(
      "Błąd pobierania statusu:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się pobrać statusu zadania.",
      },
      { status: 500 }
    );
  }
}
