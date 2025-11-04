"use client";
import { getNewNonces } from "@/auth/wallet/server-helpers";
import ThemeButton from "@/components/Buttons/theme-pill";
import { MiniKit } from "@worldcoin/minikit-js";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import FullPageLoader from "./FullPageLoader";
import { useUserAddress } from "@/hooks/useUser";

async function walletAuth() {
  const { nonce, signedNonce } = await getNewNonces();

  const nodeEnv = process.env.NODE_ENV;

  const result = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime:
      nodeEnv !== "production"
        ? new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day
    statement: `Authenticate (${crypto.randomUUID().replace(/-/g, "")}).`,
  });

  if (!result) {
    throw new Error("No response from wallet auth");
  }

  if (result.finalPayload.status !== "success") {
    console.error(
      "Wallet authentication failed",
      result.finalPayload.error_code
    );
    return;
  }

  await signIn("credentials", {
    redirectTo: "/",
    nonce,
    signedNonce,
    finalPayloadJson: JSON.stringify(result.finalPayload),
  });
}

function Loading() {
  const [isClient, setIsClient] = useState(false);
  const { userAddress } = useUserAddress();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      walletAuth();
    }
  }, [isClient]);

  if (isClient && !userAddress) {
    return (
      <div onClick={walletAuth} className="">
        <FullPageLoader message="Tap to continue..." />
      </div>
    );
  }
}

export default Loading;
