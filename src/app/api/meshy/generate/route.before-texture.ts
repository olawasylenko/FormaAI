import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.MESHY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza MESHY_API_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const imageDataUrl = body?.imageDataUrl;

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json(
        { error: "Brak obrazu do wygenerowania modelu." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.meshy.ai/openapi/v1/image-to-3d",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageDataUrl,
          model_type: "standard",
          ai_model: "latest",
          should_texture: false,
          should_remesh: false,
          image_enhancement: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.task_error?.message ||
            "Meshy odrzuciło zadanie.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      taskId: data.result,
    });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się rozpocząć generowania modelu." },
      { status: 500 }
    );
  }
}
