import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.MESHY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak konfiguracji generatora." },
        { status: 500 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Brak identyfikatora modelu." },
        { status: 400 }
      );
    }

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

    const glbUrl = taskData?.model_urls?.glb;

    if (!glbUrl) {
      return NextResponse.json(
        { error: "Plik GLB nie jest jeszcze dostępny." },
        { status: 404 }
      );
    }

    const parsedUrl = new URL(glbUrl);

    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Nieprawidłowy adres pliku modelu." },
        { status: 400 }
      );
    }

    const modelResponse = await fetch(glbUrl, {
      cache: "no-store",
    });

    if (!modelResponse.ok || !modelResponse.body) {
      return NextResponse.json(
        { error: "Nie udało się pobrać pliku GLB." },
        { status: modelResponse.status || 502 }
      );
    }

    const headers = new Headers();

    headers.set("Content-Type", "model/gltf-binary");
    headers.set("Content-Disposition", 'inline; filename="model.glb"');
    headers.set("Cache-Control", "no-store");

    const contentLength = modelResponse.headers.get("content-length");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(modelResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Błąd pobierania GLB:", error);

    return NextResponse.json(
      { error: "Nie udało się wczytać modelu 3D." },
      { status: 500 }
    );
  }
}
