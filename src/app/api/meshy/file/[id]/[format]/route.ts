import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFormats = ["glb", "fbx", "obj"] as const;
type AllowedFormat = (typeof allowedFormats)[number];

const contentTypes: Record<AllowedFormat, string> = {
  glb: "model/gltf-binary",
  fbx: "application/octet-stream",
  obj: "text/plain",
};

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      format: string;
    }>;
  }
) {
  try {
    const apiKey = process.env.MESHY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak konfiguracji generatora." },
        { status: 500 }
      );
    }

    const { id, format } = await params;

    if (
      !id ||
      !allowedFormats.includes(format as AllowedFormat)
    ) {
      return NextResponse.json(
        { error: "Nieprawidłowy format pliku." },
        { status: 400 }
      );
    }

    const selectedFormat = format as AllowedFormat;

    const taskResponse = await fetch(
      `https://api.meshy.ai/openapi/v1/image-to-3d/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    const taskData = await taskResponse.json();

    if (!taskResponse.ok) {
      return NextResponse.json(
        {
          error:
            taskData?.message ||
            taskData?.task_error?.message ||
            "Nie udało się pobrać danych modelu.",
        },
        { status: taskResponse.status }
      );
    }

    const fileUrl = taskData?.model_urls?.[selectedFormat];

    if (!fileUrl) {
      return NextResponse.json(
        {
          error: `Plik ${selectedFormat.toUpperCase()} nie jest dostępny.`,
        },
        { status: 404 }
      );
    }

    const parsedUrl = new URL(fileUrl);

    const allowedHost =
      parsedUrl.hostname === "assets.meshy.ai" ||
      parsedUrl.hostname.endsWith(".meshy.ai");

    if (parsedUrl.protocol !== "https:" || !allowedHost) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres pliku." },
        { status: 400 }
      );
    }

    const fileResponse = await fetch(fileUrl, {
      cache: "no-store",
    });

    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json(
        { error: "Nie udało się pobrać pliku." },
        { status: fileResponse.status || 502 }
      );
    }

    const headers = new Headers();

    headers.set(
      "Content-Type",
      fileResponse.headers.get("content-type") ||
        contentTypes[selectedFormat]
    );

    headers.set(
      "Content-Disposition",
      `inline; filename="model.${selectedFormat}"`
    );

    headers.set("Cache-Control", "no-store");

    const contentLength =
      fileResponse.headers.get("content-length");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(fileResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Błąd pobierania pliku modelu:", error);

    return NextResponse.json(
      { error: "Nie udało się pobrać pliku modelu." },
      { status: 500 }
    );
  }
}
