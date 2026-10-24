import { ImageResponse } from "next/og";

import { getProperty } from "@/lib/properties";
import { formatBps } from "@/lib/format";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Property preview";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { id } = await params;

  let property: Awaited<ReturnType<typeof getProperty>> | null = null;

  try {
    property = await getProperty(id);
  } catch {
    property = null;
  }

  const name = property?.name ?? "Tokenized Property";
  const location = [property?.city, property?.country]
    .filter(Boolean)
    .join(", ");
  const yieldLabel =
    property?.expectedYieldBps != null
      ? formatBps(property.expectedYieldBps)
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "80px",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 32,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          Tokenized Property
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          {location ? (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                color: "#cbd5e1",
              }}
            >
              {location}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {yieldLabel ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#94a3b8",
                }}
              >
                Expected Yield
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#34d399",
                }}
              >
                {yieldLabel}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#94a3b8",
            }}
          >
            {property ? "View details" : "Property"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}