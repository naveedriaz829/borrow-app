import { getUserPosition } from "@/lib/position";
import { useQuery } from "@tanstack/react-query";
import type { PublicClient, Transport } from "viem";
import { worldchain } from "viem/chains";
import { usePublicClient } from "wagmi";
import { useUserAddress } from "./useUser";

export const useMorphoPosition = () => {
  const client = usePublicClient();
  const { userAddress } = useUserAddress();

  const { data: position } = useQuery({
    queryKey: ["morpho-position"],
    queryFn: () => {
      if (!client || !userAddress) {
        throw new Error("Client or session data is not available");
      }
      return getUserPosition(
        client as PublicClient<Transport, typeof worldchain>,
        userAddress
      );
    },
    enabled: !!userAddress && !!client,
  });

  return position;
};
