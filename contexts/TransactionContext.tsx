import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { TransactionReceipt } from "viem";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { usePublicClient } from "wagmi";
import { PublicClient } from "viem";
import { Transport } from "wagmi";
import { worldchain } from "viem/chains";

// interface TransactionState {
//   // Store all amounts as bigints
//   depositTxnHash: string | null;
//   withdrawTxnHash: string | null;
//   depositIsPending: boolean;
//   withdrawIsPending: boolean;
//   // Methods now take bigint parameters
//   updateWithdrawTxnHash: (txnHash: string) => void;
//   updateDepositTxnHash: (txnHash: string) => void;
//   updateDepositIsPending: (isPending: boolean) => void;
//   updateWithdrawIsPending: (isPending: boolean) => void;
// }

interface TransactionState {
  txnHash: string | null;
  txnWLDAmount: string | null;
  txnUSDAmount: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  receipt: TransactionReceipt | undefined;
  updateTxnID: (txnID: string) => void;
  updateTxnWLDAmount: (wldAmount: string) => void;
  updateTxnUSDAmount: (usdAmount: string) => void;
}

const TransactionContext = createContext<TransactionState | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [txnID, setTxnID] = useState<string | null>(null);
  const [txnWLDAmount, setTxnWLDAmount] = useState<string | null>("0");
  const [txnUSDAmount, setTxnUSDAmount] = useState<string | null>("0.00");

  const txId = useMemo(() => {
    if (!txnID) return "";
    return txnID;
  }, [txnID]);
  const client = usePublicClient() as PublicClient<
    Transport,
    typeof worldchain
  >;
  const { isLoading, isSuccess, error, receipt } = useWaitForTransactionReceipt(
    {
      client,
      appConfig: {
        app_id: process.env.NEXT_PUBLIC_APP_ID!,
      },
      transactionId: txId,
    }
  );

  const txnHash = useMemo(() => {
    if (!receipt?.transactionHash) return "";
    return receipt.transactionHash;
  }, [receipt?.transactionHash]);

  const updateTxnID = useCallback((txnID: string) => {
    setTxnID(txnID);
  }, []);
  const updateTxnWLDAmount = useCallback((wldAmount: string) => {
    setTxnWLDAmount(wldAmount);
  }, []);
  const updateTxnUSDAmount = useCallback((usdAmount: string) => {
    setTxnUSDAmount(usdAmount);
  }, []);


  return (
    <TransactionContext.Provider
      value={{
        txnHash,
        txnWLDAmount,
        txnUSDAmount,
        isLoading,
        isSuccess,
        error,
        receipt,
        updateTxnID,
        updateTxnWLDAmount,
        updateTxnUSDAmount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionState(): TransactionState {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within TransactionProvider");
  }
  return context;
}
