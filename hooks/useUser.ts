import { useSession } from "next-auth/react";
import { Address } from "viem";

export const useUserAddress = () => {
  const session = useSession();
  const user = session.data?.user;

  // Check if running on localhost:3000
  const isLocalhost =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    window.location.port === "3000";

  const userAddress = isLocalhost
    ? ("0xa565aa0677c387e0b599e6035a44438f596a2fc5" as Address)
    : ((user?.id || null) as Address | null);

  return { userAddress };
};
