import { useQuery } from "@tanstack/react-query";
import { Address, erc20Abi, PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { useUserAddress } from "./useUser";

const USDCE_TOKEN_ADDRESS = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";

export async function getUSDCBalance(
  publicClient: PublicClient,
  address: Address
) {
  if (!publicClient) return null;

  return publicClient.readContract({
    address: USDCE_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
}
export function useUSDCBalance() {
  const publicClient = usePublicClient();
  const { userAddress } = useUserAddress();

  return useQuery({
    queryKey: ["usdc-balance", userAddress],
    queryFn: async () => {
      if (!userAddress || !publicClient) return null;
      return getUSDCBalance(publicClient, userAddress);
    },
    enabled: !!userAddress && !!publicClient,
  });
}
