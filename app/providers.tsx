"use client"
import '../lib/i18n'; 
// import { BorrowProvider } from "@/contexts/BorrowContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { worldchain } from "viem/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import "../lib/i18n";

// Create the Wagmi config with WorldCoin chain
const config = createConfig({
  chains: [worldchain],
  transports: {
    [worldchain.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
  // Eruda is only enabled in development
  useEffect(() => {
    const initEruda = async () => {
      if (
        process.env.NEXT_PUBLIC_APP_ENV !== "production" &&
        typeof window !== "undefined"
      ) {
        try {
          const eruda = (await import("eruda")).default;
          eruda.init();
        } catch (error) {
          console.log("Eruda failed to initialize", error);
        }
      }
    };
    initEruda();
  }, []);

  return (
    <SessionProvider session={session}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <MiniKitProvider>
            {/* <BorrowProvider> */}
              <TransactionProvider>{children}</TransactionProvider>
            {/* </BorrowProvider> */}
          </MiniKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
