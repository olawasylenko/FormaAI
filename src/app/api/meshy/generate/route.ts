import { NextResponse } from "next/server";
import {
  chargeCredits,
  InsufficientCreditsError,
  refundCharge,
  registerGenerationTask,
  type ChargeResult,
} from "@/lib/credits";
import {
  RequestAuthError,
  verifyRequestUser,
} from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let uid = "";
  let charge: ChargeResult | null = null;

  try {
    const user = await verifyRequestUser(request);
    uid = user.uid;

    const apiKey = process.env.MESHY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak konfiguracji generatora." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const imageDataUrl = body?.imageDataUrl;
    const shouldTexture =
      body?.shouldTexture === true;

    if (
      !imageDataUrl ||
      typeof imageDataUrl !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Brak zdjęcia do wygenerowania obiektu.",
        },
        { status: 400 }
      );
    }

    const creditCost = shouldTexture ? 30 : 20;

    charge = await chargeCredits(
      uid,
      creditCost,
      {
        shouldTexture,
        operation: "image-to-3d",
      }
    );

    const generationSettings = {
      image_url: imageDataUrl,
      model_type: "standard",
      ai_model: "latest",
      should_texture: shouldTexture,
      should_remesh: false,
      image_enhancement: true,

      ...(shouldTexture
        ? {
            enable_pbr: true,
            remove_lighting: true,
          }
        : {}),
    };

    const response = await fetch(
      "https://api.meshy.ai/openapi/v1/image-to-3d",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generationSettings),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      await refundCharge(
        uid,
        charge,
        "Generator nie przyjął zadania."
      );

      charge = null;

      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.task_error?.message ||
            "Nie udało się rozpocząć generowania obiektu.",
        },
        { status: response.status }
      );
    }

    if (!data?.result) {
      await refundCharge(
        uid,
        charge,
        "Generator nie zwrócił identyfikatora zadania."
      );

      charge = null;

      return NextResponse.json(
        {
          error:
            "Generator nie zwrócił identyfikatora zadania.",
        },
        { status: 502 }
      );
    }

    await registerGenerationTask(
      data.result,
      uid,
      charge,
      shouldTexture,
      creditCost
    );

    return NextResponse.json({
      taskId: data.result,
      withTexture: shouldTexture,
      creditsCharged: creditCost,
      remainingCredits:
        charge.remainingCredits,
    });
  } catch (error) {
    if (charge && uid) {
      try {
        await refundCharge(
          uid,
          charge,
          "Błąd uruchamiania generatora."
        );
      } catch (refundError) {
        console.error(
          "Nie udało się zwrócić kredytów:",
          refundError
        );
      }
    }

    if (error instanceof RequestAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "INSUFFICIENT_CREDITS",
          availableCredits:
            error.availableCredits,
          requiredCredits:
            error.requiredCredits,
        },
        { status: 402 }
      );
    }

    console.error(
      "Błąd uruchamiania generowania:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się rozpocząć generowania obiektu.",
      },
      { status: 500 }
    );
  }
}
