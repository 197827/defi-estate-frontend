import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({
      required_error: "NEXT_PUBLIC_API_URL is required",
      invalid_type_error: "NEXT_PUBLIC_API_URL must be a string",
    })
    .min(1, "NEXT_PUBLIC_API_URL must not be empty")
    .url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet", "futurenet"], {
    required_error: "NEXT_PUBLIC_STELLAR_NETWORK is required",
    invalid_type_error: "NEXT_PUBLIC_STELLAR_NETWORK must be a string",
    errorMap: () => ({
      message:
        "NEXT_PUBLIC_STELLAR_NETWORK must be one of: testnet, mainnet, futurenet",
    }),
  }),
});

export type Env = z.infer<typeof envSchema>;

function formatErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return `  - ${path}: ${issue.message}`;
    })
    .join("\n");
}

function validateEnv(rawEnv: Record<string, string | undefined>): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: rawEnv.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STELLAR_NETWORK: rawEnv.NEXT_PUBLIC_STELLAR_NETWORK,
  });

  if (!parsed.success) {
    throw new Error(
      `❌ Invalid environment variables:\n${formatErrors(parsed.error)}\n\n` +
        "Please check your .env file and ensure all required NEXT_PUBLIC_* variables are set correctly.",
    );
  }

  return parsed.data;
}

const skipValidation = process.env.SKIP_ENV_VALIDATION === "true";

let env: Env;

if (skipValidation) {
  // In CI type-check mode we skip validation and fall back to raw values.
  env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
    NEXT_PUBLIC_STELLAR_NETWORK:
      (process.env.NEXT_PUBLIC_STELLAR_NETWORK as Env["NEXT_PUBLIC_STELLAR_NETWORK"]) ??
      "testnet",
  };
} else {
  env = validateEnv(process.env);
}

export { env, validateEnv };
export default env;
```

File: src/lib/env.test.ts

```ts
import { describe, it, expect } from "vitest";
import { validateEnv } from "./env";

describe("validateEnv", () => {
  it("accepts valid environment variables", () => {
    const result = validateEnv({
      NEXT_PUBLIC_API_URL: "https://api.example.com",
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
    });

    expect(result).toEqual({
      NEXT_PUBLIC_API_URL: "https://api.example.com",
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
    });
  });

  it("accepts mainnet and futurenet networks", () => {
    expect(
      validateEnv({
        NEXT_PUBLIC_API_URL: "https://api.example.com",
        NEXT_PUBLIC_STELLAR_NETWORK: "mainnet",
      }).NEXT_PUBLIC_STELLAR_NETWORK,
    ).toBe("mainnet");

    expect(
      validateEnv({
        NEXT_PUBLIC_API_URL: "https://api.example.com",
        NEXT_PUBLIC_STELLAR_NETWORK: "futurenet",
      }).NEXT_PUBLIC_STELLAR_NETWORK,
    ).toBe("futurenet");
  });

  it("throws a readable error when NEXT_PUBLIC_API_URL is missing", () => {
    expect(() =>
      validateEnv({
        NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      }),
    ).toThrow(/NEXT_PUBLIC_API_URL/);
  });

  it("throws a readable error when NEXT_PUBLIC_API_URL is not a valid URL", () => {
    expect(() =>
      validateEnv({
        NEXT_PUBLIC_API_URL: "not-a-url",
        NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      }),
    ).toThrow(/NEXT_PUBLIC_API_URL must be a valid URL/);
  });

  it("throws a readable error when NEXT_PUBLIC_STELLAR_NETWORK is invalid", () => {
    expect(() =>
      validateEnv({
        NEXT_PUBLIC_API_URL: "https://api.example.com",
        NEXT_PUBLIC_STELLAR_NETWORK: "devnet",
      }),
    ).toThrow(/NEXT_PUBLIC_STELLAR_NETWORK/);
  });

  it("throws a readable error when NEXT_PUBLIC_STELLAR_NETWORK is missing", () => {
    expect(() =>
      validateEnv({
        NEXT_PUBLIC_API_URL: "https://api.example.com",
      }),
    ).toThrow(/NEXT_PUBLIC_STELLAR_NETWORK/);
  });
});