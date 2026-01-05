import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://samuel-narrative.vercel.app";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Samuel's Blog";
  const description = searchParams.get("description") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "60px 80px",
        }}
      >
        {/* Logo / Site name */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <span
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Samuel&apos;s Blog
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: "90%",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 40 ? 48 : 64,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              margin: 0,
              textShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: 24,
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.4,
                margin: 0,
                maxWidth: "80%",
              }}
            >
              {description.length > 100
                ? description.slice(0, 100) + "..."
                : description}
            </p>
          )}
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            right: 200,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(118,75,162,0.2) 0%, transparent 70%)",
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: 20,
          }}
        >
          {BASE_URL.replace("https://", "")}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
