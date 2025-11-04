import { AccrualPosition, MarketId } from "@morpho-org/blue-sdk";
import "@morpho-org/blue-sdk-viem/lib/augment/Market";
import "@morpho-org/blue-sdk-viem/lib/augment/Position";
import type { Address, PublicClient, Transport } from "viem";
import { worldchain } from "viem/chains";

const MARKET_ID =
  "0xba0ae12a5cdbf9a458566be68055f30c859771612950b5e43428a51becc6f6e9" as `0x${string}`;

export const getUserPosition = async (
  client: PublicClient<Transport, typeof worldchain>,
  address: Address
) => {
  const position = await AccrualPosition.fetch(
    address,
    MARKET_ID as MarketId,
    client
  );
  return position;
};
