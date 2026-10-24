I'll create the `src/lib/soroban.ts` file with the Soroban helpers for the claim flow. Since I don't have visibility into the exact existing network configuration conventions, I'll use standard Stellar/Soroban patterns with sensible defaults that can be adjusted.

```typescript
import {
  Contract,
  Networks,
  TransactionBuilder,
  Account,
  BASE_FEE,
  xdr,
  scValToNative,
  nativeToScVal,
  SorobanRpc,
  Transaction,
  TimeoutInfinite,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

/**
 * Network configuration.
 *
 * These values follow the project's network conventions. The RPC URL and
 * network passphrase default to Stellar Testnet and can be overridden via
 * environment variables so the same helpers work against Futurenet/Mainnet.
 */
export const SOROBAN_RPC_URL =
  import.meta.env?.VITE_SOROBAN_RPC_URL ??
  "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  import.meta.env?.VITE_NETWORK_PASSPHRASE ?? Networks.TESTNET;

export const EXPLORER_BASE_URL =
  import.meta.env?.VITE_EXPLORER_BASE_URL ??
  "https://stellar.expert/explorer/testnet";

/** A single Soroban RPC server instance shared across helpers. */
export const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL, {
  allowHttp: SOROBAN_RPC_URL.startsWith("http://"),
});

/**
 * Discriminated error kinds so the UI can distinguish a rejected signature
 * from a simulation failure or a submission failure.
 */
export type ClaimErrorKind =
  | "simulation"
  | "signature-rejected"
  | "signature-failed"
  | "submission"
  | "confirmation"
  | "unknown";

export class ClaimError extends Error {
  readonly kind: ClaimErrorKind;

  constructor(kind: ClaimErrorKind, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "ClaimError";
    this.kind = kind;
    if (options?.cause !== undefined) {
      // Preserve the original error for debugging without breaking typing.
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/** Result of reading a claimable amount. */
export interface ClaimableAmountResult {
  /** Raw amount as a bigint (stroops / base units of the payout asset). */
  amount: bigint;
  /** Whether the amount is greater than zero. */
  hasClaimable: boolean;
}

/** Result of a successful claim submission. */
export interface ClaimSubmitResult {
  hash: string;
  explorerUrl: string;
}

/** Builds the explorer URL for a transaction hash. */
export function getExplorerUrl(hash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${hash}`;
}

/**
 * Parses a Soroban return value into a bigint amount. Handles i128/u128
 * (returned as bigint by `scValToNative`) as well as string/number fallbacks.
 */
function parseAmount(retval: xdr.ScVal | undefined): bigint {
  if (!retval) {
    throw new ClaimError("simulation", "Contract returned no value.");
  }

  const native = scValToNative(retval);

  if (typeof native === "bigint") {
    return native;
  }
  if (typeof native === "number") {
    return BigInt(Math.trunc(native));
  }
  if (typeof native === "string") {
    return BigInt(native);
  }

  throw new ClaimError(
    "simulation",
    `Unexpected claimable return type: ${typeof native}.`,
  );
}

/**
 * Reads `claimable(holder)` from a yield-distributor contract by simulating
 * the invocation. Does not require a signature.
 */
export async function getClaimableAmount(
  distributorAddress: string,
  holderAddress: string,
): Promise<ClaimableAmountResult> {
  const contract = new Contract(distributorAddress);

  // A throwaway source account is fine for read-only simulation.
  const sourceAccount = new Account(holderAddress, "0");

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("claimable", nativeToScVal(holderAddress, { type: "address" })))
    .setTimeout(TimeoutInfinite)
    .build();

  let simulation: SorobanRpc.Api.SimulateTransactionResponse;
  try {
    simulation = await sorobanServer.simulateTransaction(tx);
  } catch (err) {
    throw new ClaimError("simulation", "Failed to reach the Soroban RPC.", {
      cause: err,
    });
  }

  if (SorobanRpc.Api.isSimulationError(simulation)) {
    throw new ClaimError(
      "simulation",
      `Could not read claimable amount: ${simulation.error}`,
      { cause: simulation },
    );
  }

  if (!SorobanRpc.Api.isSimulationSuccess(simulation)) {
    throw new ClaimError("simulation", "Simulation did not return a result.");
  }

  const amount = parseAmount(simulation.result?.retval);
  return { amount, hasClaimable: amount > 0n };
}

/**
 * Builds an unsigned `claim(holder)` transaction for the given distributor.
 * The source account is the holder, since `claim` must be signed by them.
 */
export async function buildClaimTransaction(
  distributorAddress: string,
  holderAddress: string,
): Promise<Transaction> {
  const contract = new Contract(distributorAddress);

  // Fetch the real sequence number for the holder's account.
  let account: Account;
  try {
    const accountResponse = await sorobanServer.getAccount(holderAddress);
    account = new Account(holderAddress, accountResponse.sequenceNumber());
  } catch (err) {
    throw new ClaimError(
      "submission",
      "Could not load your account. Make sure it is funded on this network.",
      { cause: err },
    );
  }

  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("claim", nativeToScVal(holderAddress, { type: "address" })),
    )
    .setTimeout(TimeoutInfinite)
    .build();
}

/**
 * Simulates the claim transaction and assembles the prepared transaction
 * (footprint, resource fees, auth entries). Throws a `ClaimError` with kind
 * `"simulation"` on failure.
 */
export async function simulateClaimTransaction(
  tx: Transaction,
): Promise<Transaction> {
  let simulation: SorobanRpc.Api.SimulateTransactionResponse;
  try {
    simulation = await sorobanServer.simulateTransaction(tx);
  } catch (err) {
    throw new ClaimError("simulation", "Failed to reach the Soroban RPC.", {
      cause: err,
    });
  }

  if (SorobanRpc.Api.isSimulationError(simulation)) {
    throw new ClaimError(
      "simulation",
      `Claim simulation failed: ${simulation.error}`,
      { cause: simulation },
    );
  }

  if (!SorobanRpc.Api.isSimulationSuccess(simulation)) {
    throw new ClaimError("simulation", "Claim simulation did not succeed.");
  }

  try {
    return SorobanRpc.assembleTransaction(tx, simulation).build();
  } catch (err) {
    throw new ClaimError(
      "simulation",
      "Failed to assemble the claim transaction.",
      { cause: err },
    );
  }
}

/**
 * Signs the prepared transaction with Freighter and submits it, polling for
 * confirmation. Distinguishes a user-rejected signature from other failures.
 */
export async function signAndSubmitClaim(
  tx: Transaction,
): Promise<ClaimSubmitResult> {
  const preparedXdr = tx.toXDR();

  let signedXdr: string;
  try {
    const signed = await signTransaction(preparedXdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Freighter returns either a string or an object depending on version.
    if (typeof signed === "string") {
      signedXdr = signed;
    } else if (signed && typeof signed === "object" && "signedTxXdr" in signed) {
      signedXdr = (signed as { signedTxXdr: string }).signedTxXdr;
    } else {
      throw new ClaimError(
        "signature-failed",
        "Freighter returned an unexpected response.",
      );
    }
  } catch (err) {
    if (err instanceof ClaimError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    // Freighter surfaces user rejection with messages containing "reject"
    // or "denied" (case-insensitive).
    if (/reject|denied|cancel/i.test(message)) {
      throw new ClaimError(
        "signature-rejected",
        "Signature request was rejected. No transaction was submitted.",
        { cause: err },
      );
    }
    throw new ClaimError(
      "signature-failed",
      `Could not sign the transaction: ${message}`,
      { cause: err },
    );
  }

  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE,
  ) as Transaction;

  let sendResponse: SorobanRpc.Api.SendTransactionResponse;
  try {
    sendResponse = await sorobanServer.sendTransaction(signedTx);
  } catch (err) {
    throw new ClaimError("submission", "Failed to submit the claim transaction.", {
      cause: err,
    });
  }

  if (sendResponse.status === "ERROR") {
    throw new ClaimError(
      "submission",
      `Claim submission failed: ${JSON.stringify(sendResponse.errorResult ?? sendResponse.status)}`,
      { cause: sendResponse },
    );
  }

  const hash = sendResponse.hash;

  // Poll for confirmation.
  const finalStatus = await pollForConfirmation(hash);
  if (finalStatus !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new ClaimError(
      "confirmation",
      `Claim transaction did not succeed (status: ${finalStatus}).`,
    );
  }

  return { hash, explorerUrl: getExplorerUrl(hash) };
}

/**
 * Polls `getTransaction` until it reaches a terminal status or times out.
 */
async function pollForConfirmation(
  hash: string,
  { attempts = 30, intervalMs = 1000 } = {},
): Promise<SorobanRpc.Api.GetTransactionStatus> {
  for (let i = 0; i < attempts; i++) {
    let response: SorobanRpc.Api.GetTransactionResponse;
    try {
      response = await sorobanServer.getTransaction(hash);
    } catch (err) {
      throw new ClaimError("confirmation", "Failed to check transaction status.", {
        cause: err,
      });
    }

    if (response.status !== SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      return response.status;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new ClaimError(
    "confirmation",
    "Timed out waiting for the claim transaction to confirm.",
  );
}