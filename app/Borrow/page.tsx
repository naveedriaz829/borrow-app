"use client";
import HollowThemePill from "@/components/Buttons/hollow-theme-pill";
import ThemePill from "@/components/Buttons/theme-pill";
import Review from "@/components/Confirmation/review";
import BorrowCard from "@/components/Displays/borrow-card";
import InputAmount from "@/components/Displays/input-amount";
import CircularGauge from "@/components/Displays/interactive-gauge";
import FullPageLoader from "@/components/LoadApp/FullPageLoader";
import { useMaxBorrowAmount } from "@/hooks/useMaxBorrowAmount";
import { useMorpho } from "@/hooks/useMorpho";
import { useMorphoPosition } from "@/hooks/useMorphoPosition";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserAddress } from "@/hooks/useUser";
import { formatUSD, formatWLD, parseUSD } from "@/lib/format";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { PublicClient, Transport } from "viem";
import { worldchain } from "viem/chains";
import { usePublicClient } from "wagmi";
import { BiGlobe } from "react-icons/bi";
import LanguageDrawer from "@/components/Drawers/LanguageDrawer";
import { useTranslation } from "react-i18next";

export default function Borrow() {
  const { t } = useTranslation();
  const position = useMorphoPosition();
  const [numPad, setNumPad] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("0");
  const [transactionId, setTransactionId] = useState<string>("");
  const [collateralAmount, setCollateralAmount] = useState<bigint>(0n);
  const [collateralAmountDisplay, setCollateralAmountDisplay] =
    useState<string>("0");
  const { maxBorrowAmount } = useMaxBorrowAmount();
  const maxBorrowBasedOnExistingCollateral =
    maxBorrowAmount?.maxBorrowAdjustedForLTV || 0n;
  const maxBorrowTotal = maxBorrowAmount?.totalMaxBorrowable || 0n;
  const maxBorrowBasedOnBalance =
    maxBorrowAmount?.maxBorrowAmountBasedOnBalance || 0n;
  const client = usePublicClient() as PublicClient<
    Transport,
    typeof worldchain
  >;
  const { handleBorrow, getRequiredCollateralAmount } = useMorpho();
  const { userAddress } = useUserAddress();
  const router = useRouter();
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isError, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    client,
    appConfig: {
      app_id: process.env.NEXT_PUBLIC_APP_ID!,
    },
    transactionId,
  });
  const { requestPermission, notificationStatus } =
    useNotifications(userAddress);
  const [isLanguageDrawerVisible, setIsLanguageDrawerVisible] = useState(false);

  useEffect(() => {
    if (isConfirmed && userAddress && notificationStatus == null) {
      console.log("requesting permission...");
      setTimeout(() => {
        requestPermission();
      }, 100);
    }
  }, [isConfirmed, userAddress, notificationStatus, requestPermission]);

  function updateAmount(amt: string) {
    setAmount(amt);
  }

  const calculateCollateral = useCallback(
    async (usdAmount: string) => {
      console.log("calculateCollateral: usdAmount: ", usdAmount);
      if (!usdAmount || usdAmount === "0") {
        setCollateralAmount(0n);
        setCollateralAmountDisplay("0");
        return;
      }

      try {
        let convertedUsdAmount = parseUSD(usdAmount);

        if (maxBorrowBasedOnExistingCollateral > 0n) {
          convertedUsdAmount =
            convertedUsdAmount > maxBorrowBasedOnExistingCollateral
              ? convertedUsdAmount - maxBorrowBasedOnExistingCollateral
              : 0n;
        }
        // Ensure remaining amount doesn't exceed max borrow based on balance
        if (convertedUsdAmount > maxBorrowBasedOnBalance) {
          console.log(
            "convertedUsdAmount exceeds max borrow based on balance: ",
            convertedUsdAmount
          );
          convertedUsdAmount = maxBorrowBasedOnBalance;
        }
        const requiredCollateral = await getRequiredCollateralAmount(
          convertedUsdAmount
        );
        if (requiredCollateral) {
          setCollateralAmount(requiredCollateral);
          setCollateralAmountDisplay(formatWLD(requiredCollateral));
        }
      } catch (error) {
        console.error("Failed to calculate collateral:", error);
      }
    },
    [maxBorrowAmount, getRequiredCollateralAmount]
  );

  function openPad() {
    setNumPad(!numPad);
  }

  useEffect(() => {
    if (numPad && inputElement) {
      inputElement.focus();
    }
  }, [numPad, inputElement]);

  function toggleReview() {
    calculateCollateral(amount);
    setNumPad(false);
    setReview(true);
  }

  async function onConfirm() {
    if (!userAddress) {
      alert(t("borrow.wallet.connect"));
      return;
    }
    try {
      setIsLoading(true);
      let borrowAmount = parseUSD(amount);
      // First ensure we don't exceed total max borrow
      if (borrowAmount > maxBorrowTotal) {
        borrowAmount = maxBorrowTotal;
      }
      const txId = await handleBorrow(collateralAmount, borrowAmount);
      setTransactionId(txId);
    } catch (error) {
      console.error("Failed to borrow:", error);
      setIsLoading(false);
    }
  }

  const handleInputRef = (element: HTMLInputElement | null) => {
    setInputElement(element);
  };

  const formatedMaxBorrowAmountUSD = useMemo(() => {
    return maxBorrowAmount
      ? formatUSD((maxBorrowAmount.totalMaxBorrowable * 1000n) / 1001n)
      : "0";
  }, [maxBorrowAmount]);

  useEffect(() => {
    if (isConfirmed || isError) {
      router.push("/");
    }
  }, [isConfirmed, isError]);

  const borrowInsufficient = Number(amount) < 0.001;
  const isGreaterThanMaxBorrow =
    Number(amount) > Number(formatedMaxBorrowAmountUSD);
  const isDisabled = borrowInsufficient || isGreaterThanMaxBorrow;
  if (isLoading) {
    return <FullPageLoader message={t("common.loader.borrowing")} />;
  }
  return (
    <div className="relative no-scroll flex flex-col justify-between text-white bg-dash-gray w-full h-screen">
      <div className="absolute z-20 right-[20.5px] top-[38px]">
        <BiGlobe
          onClick={() => setIsLanguageDrawerVisible(true)}
          className="text-white text-[24px] cursor-pointer"
        />
      </div>
      <span
        className={`w-screen h-screen absolute top-0 left-0 bg-black/50 ${
          isLanguageDrawerVisible ? "z-10" : "hidden"
        }`}
      ></span>
      <LanguageDrawer
        onClose={() => setIsLanguageDrawerVisible(false)}
        isVisible={isLanguageDrawerVisible}
      />
      <span className="relative flex justify-center items-center w-full px-[38.5px]">
        <button
          onClick={() => router.back()}
          className="absolute top-0 left-[27px] h-full flex items-center"
        >
          <FaChevronLeft size={20} color="white" />
        </button>
        <h1 className="font-['PolySans'] text-white text-[clamp(12px,5vw,20px)] max-w-[clamp(200px,70vw,280px)] mt-[36px] text-center">
          {t("borrow.title")}
        </h1>
      </span>
      <>
        {numPad ? (
          <InputAmount
            inputRef={handleInputRef}
            input={amount}
            closeInput={openPad}
            updateAmount={updateAmount}
            maxAmount={maxBorrowAmount?.totalMaxBorrowable || 0n}
          />
        ) : (
          <CircularGauge
            setNumPad={openPad}
            amount={amount}
            updateAmount={updateAmount}
            maxAmount={maxBorrowAmount?.totalMaxBorrowable || 0n}
          />
        )}
        {review ? (
          <Review
            swipeText={
              isLoading
                ? t("borrow.review.confirming")
                : t("borrow.review.borrow")
            }
            onBack={() => setReview(false)}
            amount={amount}
            onConfirm={onConfirm}
            collateralAmount={collateralAmountDisplay}
            collateralSymbol="WLD"
          />
        ) : null}

        <div className="w-full flex flex-col gap-[calc(3vh)]">
          <div className="mx-6">
            <BorrowCard
              position={position}
              updateMax={() => {
                updateAmount(formatedMaxBorrowAmountUSD?.toString() || "0");
              }}
            />
          </div>
          <span className="flex w-full text-[clamp(13px,4.2vw,17px)]">
            <div onClick={toggleReview} className="h-[calc(7.5vh)] w-full mx-6">
              <ThemePill
                disabled={isDisabled}
                text={
                  isGreaterThanMaxBorrow
                    ? t("borrow.amount.tooHigh")
                    : borrowInsufficient
                    ? t("borrow.amount.insufficient")
                    : t("borrow.amount.borrow") + amount
                }
              />
            </div>
          </span>
          <span className="flex flex-col w-full mb-[10vh] text-[clamp(13px,4.2vw,17px)]">
            <div className="mx-24">
              <HollowThemePill
                handleClick={() => openPad()}
                text={t("borrow.amount.other")}
              />
            </div>
          </span>
        </div>
      </>
    </div>
  );
}
