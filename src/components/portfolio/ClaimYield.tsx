"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getClaimableAmount,
  claimYield,
  type ClaimYieldResult,
} from "@/lib/soroban";

export interface ClaimYieldProperty {
  /** Stable identifier for the property (e.g. property id or slug). */
  id: string;
  /** Human readable property name shown in the UI. */
  name: string;
  /** Yield distributor contract address for this property. */
  distributorAddress: string;
}

interface ClaimYieldProps {
  /** Connected wallet address, or null/undefined when no wallet is connected. */
  address?: string | null;
  /** Properties to display claimable yield for. */
  properties: ClaimYieldProperty[];
  /** Optional callback invoked after a successful claim. */
  onClaimSuccess?: (propertyId: string, result: ClaimYieldResult) => void;
}

type ClaimStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; txHash: string; explorerUrl: string }
  | { state: "error"; message: string; kind: "rejected" | "simulation" | "unknown" };

interface ClaimableState {
  amount: bigint | null;
  loading: boolean;
  error: string | null;
}

const STELLAR_EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx/";

function formatAmount(amount: bigint | null): string {
  if (amount === null) return "—";
  // Soroban token amounts are typically 7-decimal stroops.
  const divisor = 10_000_000n;
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction.toString().padStart(7, "0").replace(/0+$/, "");
  return `${whole.toString()}.${fractionStr}`;
}

function classifyError(error: unknown): { kind: "rejected" | "simulation" | "unknown"; message: string } {
  const rawMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

  const lower = rawMessage.toLowerCase();

  if (
    lower.includes("reject") ||
    lower.includes("denied") ||
    lower.includes("declined") ||
    lower.includes("user cancel") ||
    lower.includes("cancelled") ||
    lower.includes("canceled")
  ) {
    return {
      kind: "rejected",
      message: "Signature was rejected in Freighter. No transaction was submitted.",
    };
  }

  if (
    lower.includes("simulat") ||
    lower.includes("simulation") ||
    lower.includes("host function") ||
    lower.includes("invoke") ||
    lower.includes("contract error")
  ) {
    return {
      kind: "simulation",
      message: `Transaction simulation failed: ${rawMessage}`,
    };
  }

  return { kind: "unknown", message: rawMessage };
}

export default function ClaimYield({ address, properties, onClaimSuccess }: ClaimYieldProps) {
  const [claimable, setClaimable] = useState<Record<string, ClaimableState>>({});
  const [statuses, setStatuses] = useState<Record<string, ClaimStatus>>({});

  const propertyKey = useMemo(
    () => properties.map((p) => `${p.id}:${p.distributorAddress}`).join("|"),
    [properties],
  );

  const fetchClaimable = useCallback(
    async (property: ClaimYieldProperty) => {
      setClaimable((prev) => ({
        ...prev,
        [property.id]: {
          amount: prev[property.id]?.amount ?? null,
          loading: true,
          error: null,
        },
      }));

      try {
        const amount = await getClaimableAmount(property.distributorAddress, address ?? "");
        setClaimable((prev) => ({
          ...prev,
          [property.id]: { amount, loading: false, error: null },
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load claimable amount";
        setClaimable((prev) => ({
          ...prev,
          [property.id]: {
            amount: prev[property.id]?.amount ?? null,
            loading: false,
            error: message,
          },
        }));
      }
    },
    [address],
  );

  // Fetch claimable amounts on mount, when the wallet changes, or when the
  // property list changes.
  useEffect(() => {
    if (!address) {
      setClaimable({});
      return;
    }

    let cancelled = false;

    const load = async () => {
      await Promise.all(
        properties.map(async (property) => {
          if (cancelled) return;
          await fetchClaimable(property);
        }),
      );
    };

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, propertyKey, fetchClaimable]);

  const handleClaim = useCallback(
    async (property: ClaimYieldProperty) => {
      if (!address) return;

      setStatuses((prev) => ({ ...prev, [property.id]: { state: "pending" } }));

      try {
        const result = await claimYield(property.distributorAddress, address);
        const explorerUrl = `${STELLAR_EXPLORER_BASE}${result.txHash}`;

        setStatuses((prev) => ({
          ...prev,
          [property.id]: { state: "success", txHash: result.txHash, explorerUrl },
        }));

        onClaimSuccess?.(property.id, result);

        // Refresh the claimable amount after a successful claim.
        await fetchClaimable(property);
      } catch (error) {
        const { kind, message } = classifyError(error);
        setStatuses((prev) => ({
          ...prev,
          [property.id]: { state: "error", message, kind },
        }));
      }
    },
    [address, fetchClaimable, onClaimSuccess],
  );

  if (!address) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          Connect your wallet to view and claim your rental yield.
        </p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-600">
          You have no properties with claimable yield yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Claim Rental Yield</h2>

      <ul className="space-y-3">
        {properties.map((property) => {
          const claimableState = claimable[property.id];
          const status = statuses[property.id] ?? { state: "idle" as const };
          const amount = claimableState?.amount ?? null;
          const isLoading = claimableState?.loading ?? false;
          const loadError = claimableState?.error ?? null;
          const isPending = status.state === "pending";
          const isZero = amount !== null && amount === 0n;
          const disabled = isPending || isLoading || amount === null || isZero;

          return (
            <li
              key={property.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{property.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Claimable:{" "}
                    {isLoading ? (
                      <span className="text-gray-400">Loading…</span>
                    ) : loadError ? (
                      <span className="text-red-600">Unavailable</span>
                    ) : (
                      <span className="font-semibold text-gray-900">{formatAmount(amount)}</span>
                    )}
                  </p>
                  {loadError && (
                    <p className="mt-1 text-xs text-red-600">{loadError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void handleClaim(property)}
                  disabled={disabled}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isPending && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-hidden="true"
                    />
                  )}
                  {isPending ? "Claiming…" : "Claim"}
                </button>
              </div>

              {status.state === "success" && (
                <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
                  <p className="font-medium">Yield claimed successfully.</p>
                  <a
                    href={status.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block break-all text-green-700 underline hover:text-green-900"
                  >
                    View transaction on Stellar Expert
                  </a>
                </div>
              )}

              {status.state === "error" && (
                <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-medium">
                    {status.kind === "rejected"
                      ? "Signature rejected"
                      : status.kind === "simulation"
                        ? "Simulation failed"
                        : "Claim failed"}
                  </p>
                  <p className="mt-1 break-words">{status.message}</p>
                  <button
                    type="button"
                    onClick={() => void handleClaim(property)}
                    className="mt-2 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}