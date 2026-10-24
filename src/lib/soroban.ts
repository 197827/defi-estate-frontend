import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Account,
  nativeToScVal,
  scValToNative,
  SorobanRpc,
  xdr,
} from "@stellar/stellar-sdk";
import { getNetworkConfig } from "@/shared/contracts";

/**
 * Minimal Soroban RPC helper used by the property detail and portfolio pages.
 *
 * All functions throw on RPC failure so callers can catch and degrade
 * gracefully (e.g. show a short "unavailable" message instead of crashing).
 */

export interface TokenSupply {
  /** Shares sold so far (total_supply). */
  totalSupply: number;
  /** Maximum shares available (max_supply). */
  maxSupply: number;
  /** Percentage funded, 0-100. */
  percentFunded: number;
}

interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractId?: string;
}

function resolveNetwork(): NetworkConfig {
  const config = getNetworkConfig() as Partial<NetworkConfig> | undefined;

  const rpcUrl =
    config?.rpcUrl ??
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ??
    "https://soroban-testnet.stellar.org";

  const networkPassphrase =
    config?.networkPassphrase ??
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ??
    Networks.TESTNET;

  return { rpcUrl, networkPassphrase };
}

function createServer(): SorobanRpc.Server {
  const { rpcUrl } = resolveNetwork();
  return new SorobanRpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith("http://") });
}

/**
 * A throwaway source account is fine for read-only simulations; the account
 * does not need to exist on-chain for `simulateTransaction`.
 */
function buildSourceAccount(): Account {
  return new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
}

/**
 * Simulate a read-only contract call and return the decoded native value.
 */
async function simulateContractCall(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<unknown> {
  const server = createServer();
  const { networkPassphrase } = resolveNetwork();

  const contract = new Contract(contractId);
  const operation = contract.call(method, ...args);

  const transaction = new TransactionBuilder(buildSourceAccount(), {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const response = await server.simulateTransaction(transaction);

  if (SorobanRpc.Api.isSimulationError(response)) {
    throw new Error(`Soroban simulation failed for ${method}: ${response.error}`);
  }

  if (!SorobanRpc.Api.isSimulationSuccess(response) || !response.result) {
    throw new Error(`Soroban simulation returned no result for ${method}`);
  }

  return scValToNative(response.result.retval);
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Read `total_supply` and `max_supply` from a property token contract.
 */
export async function getTokenSupply(contractId: string): Promise<TokenSupply> {
  if (!contractId) {
    throw new Error("Missing property token contract id");
  }

  const [totalRaw, maxRaw] = await Promise.all([
    simulateContractCall(contractId, "total_supply"),
    simulateContractCall(contractId, "max_supply"),
  ]);

  const totalSupply = toNumber(totalRaw);
  const maxSupply = toNumber(maxRaw);

  const percentFunded =
    maxSupply > 0 ? Math.min(100, Math.max(0, (totalSupply / maxSupply) * 100)) : 0;

  return { totalSupply, maxSupply, percentFunded };
}

/**
 * Read `balance(address)` from a property token contract.
 */
export async function getTokenBalance(
  contractId: string,
  address: string,
): Promise<number> {
  if (!contractId) {
    throw new Error("Missing property token contract id");
  }
  if (!address) {
    throw new Error("Missing holder address");
  }

  const result = await simulateContractCall(contractId, "balance", [
    nativeToScVal(address, { type: "address" }),
  ]);

  return toNumber(result);
}