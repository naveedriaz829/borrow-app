import { Morpho } from "@/lib/morpho";
import { useQuery } from "@tanstack/react-query";
import { MiniKit, SendTransactionPayload } from "@worldcoin/minikit-js";
import { PublicClient, Transport } from "viem";
import { worldchain } from "viem/chains";
import { usePublicClient } from "wagmi";
import { useUserAddress } from "./useUser";
import { useWLDBalance } from "./useWLDBalance";
import { useMorphoPosition } from "./useMorphoPosition";
import type { AccrualPosition } from "@morpho-org/blue-sdk";
import { useIndexBorrower } from "./useIndexBorrower";

export function useMorpho() {
  const client = usePublicClient();
  const { userAddress } = useUserAddress();
  const { data: wldBalance } = useWLDBalance();
  const position: AccrualPosition | undefined = useMorphoPosition();
  const { writeUserIfNotExists } = useIndexBorrower(userAddress)

  const { data: morpho } = useQuery({
    queryKey: ["morpho"],
    queryFn: () =>
      new Morpho(client as PublicClient<Transport, typeof worldchain>),
    enabled: !!client,
  });

  const validateMorphoInitialized = () => {
    if (!morpho) {
      throw new Error("morpho not initialized!");
    }
  };

  const validateCtx = () => {
    if (!userAddress) {
      throw new Error("No wallet connected");
    }

    if (!morpho) {
      throw new Error("Morpho instance not initialized");
    }

    if (!client) {
      throw new Error("Client not initialized");
    }

    if (!wldBalance) {
      throw new Error("Failed to get WLD balance");
    }
  };

  const sendTransaction = async (input: SendTransactionPayload) => {
    const { commandPayload, finalPayload } =
      await MiniKit.commandsAsync.sendTransaction(input);

    console.log({ commandPayload, finalPayload });

    if (finalPayload.status === "error") {
      console.log(finalPayload.status);
      console.log(finalPayload.error_code);
      console.log(finalPayload.details);
      throw new Error(
        `Failed to borrow: ${JSON.stringify(finalPayload.details)} ${
          finalPayload.error_code
        }`
      );
    } else {
      // console.log("writing user if not exists", userAddress)
      await writeUserIfNotExists()
    }

    return finalPayload.transaction_id;
  };

  const handleBorrow = async (
    collateralAmount: bigint,
    borrowAmount: bigint,
    isMax?: boolean
  ) => {
    validateCtx();

    if (wldBalance && wldBalance < collateralAmount) {
      throw new Error("Insufficient WLD balance");
    }

    console.log("borrowing", {
      wldBalance,
      collateralAmount,
      borrowAmount,
      userAddress,
    });

    return await sendTransaction(
      await morpho!.borrow(collateralAmount, borrowAmount, userAddress!)
    );
  };

  const handleRepay = async (borrowShares: string, isMax?: boolean) => {
    validateCtx();

    console.log("repaying", {
      borrowShares,
      userAddress,
    });

    return await sendTransaction(
      await morpho!.repay(borrowShares, userAddress!)
    );
  };

  const handleSupplyCollateral = async (collateralAmount: string, isMax?: boolean) => {
    validateCtx();

    console.log("supplying collateral", {
      collateralAmount,
      userAddress,
    });

    return await sendTransaction(
      morpho!.supplyCollateral(collateralAmount, userAddress!)
    );
  };

  const handleWithdrawCollateral = async (collateralAmount: string, isMax?: boolean) => {
    validateCtx();
    console.log("handling withdraw collateral", {
      collateralAmount,
      userAddress,
    });

    return await sendTransaction(
      await morpho!.withdrawCollateral(collateralAmount, userAddress!)
    );
  };

  const getBorrowAPY = async () => {
    validateMorphoInitialized();
    const ratePerSecond = await morpho!.getBorrowRate();
    const secondsInYear = 31536000;
    // Convert rate to a number with 18 decimal precision
    const rate = Number(ratePerSecond) / 1e18;
    // Calculate exp(rate * seconds) - 1
    const borrowAPY = Math.exp(rate * secondsInYear) - 1;

    return borrowAPY;
  };

  const getRequiredCollateralAmount = async (borrowAmount: bigint) => {
    validateMorphoInitialized();
    return await morpho!.getRequiredCollateralAmount(borrowAmount);
  };

  const getWLDPrice = async () => {
    validateMorphoInitialized();
    return await morpho!.getWLDPrice();
  };

  const getMaxBorrowAmountBasedOnBalance = async () => {
    validateCtx();
    return await morpho!.getMaxBorrowableAmount(wldBalance!);
  };

  return {
    handleBorrow,
    handleRepay,
    getRequiredCollateralAmount,
    handleSupplyCollateral,
    handleWithdrawCollateral,
    getWLDPrice,
    getBorrowAPY,
    ready: morpho !== undefined,
    getMaxBorrowAmountBasedOnBalance,
  };
}
