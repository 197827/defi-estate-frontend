'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
} from '@stellar/freighter-api';

const EXPECTED_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK;

interface WalletContextValue {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  networkMismatch: boolean;
  freighterNetwork: string | null;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [freighterNetwork, setFreighterNetwork] = useState<string | null>(null);

  const checkNetwork = useCallback(async () => {
    try {
      const result = await getNetwork();
      if (result && !result.error && result.network) {
        setFreighterNetwork(result.network);
      } else {
        setFreighterNetwork(null);
      }
    } catch {
      setFreighterNetwork(null);
    }
  }, []);

  const restoreConnection = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (!connected || connected.error || !connected.isConnected) {
        return;
      }

      const result = await getAddress();
      if (result && !result.error && result.address) {
        setAddress(result.address);
        await checkNetwork();
      }
    } catch {
      // Ignore errors while restoring the connection.
    }
  }, [checkNetwork]);

  useEffect(() => {
    void restoreConnection();
  }, [restoreConnection]);

  const connect = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (!connected || connected.error || !connected.isConnected) {
        return;
      }

      const result = await requestAccess();
      if (result && !result.error && result.address) {
        setAddress(result.address);
        await checkNetwork();
      }
    } catch {
      // Ignore errors while connecting.
    }
  }, [checkNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setFreighterNetwork(null);
  }, []);

  const networkMismatch = useMemo(() => {
    if (!address || !freighterNetwork || !EXPECTED_NETWORK) {
      return false;
    }
    return freighterNetwork.toUpperCase() !== EXPECTED_NETWORK.toUpperCase();
  }, [address, freighterNetwork]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      connect,
      disconnect,
      networkMismatch,
      freighterNetwork,
    }),
    [address, connect, disconnect, networkMismatch, freighterNetwork],
  );

  return (
    <WalletContext.Provider value={value}>
      {networkMismatch && (
        <div
          role="alert"
          className="w-full bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-800"
        >
          Freighter is connected to {freighterNetwork}, but this app expects{' '}
          {EXPECTED_NETWORK}. Please switch networks in Freighter.
        </div>
      )}
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
</｜｜DSML｜｜ parameter>
</｜｜DSML｜｜ invoke>
</｜｜DSML｜｜ calls>