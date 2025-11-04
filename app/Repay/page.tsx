"use client";
import HollowThemePill from "@/components/Buttons/hollow-theme-pill";
import ThemePill from "@/components/Buttons/theme-pill";
import Review from "@/components/Confirmation/review";
import InputAmount from "@/components/Displays/input-amount";
import CircularGauge from "@/components/Displays/interactive-gauge";
import RepayCard from "@/components/Displays/repay-card";
import { useMorpho } from "@/hooks/useMorpho";
import { useMorphoPosition } from "@/hooks/useMorphoPosition";
import { parseUSD, formatUSD } from "@/lib/format";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { useEffect, useState } from "react";
import { PublicClient, Transport } from "viem";
import { worldchain } from "viem/chains";
import { usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/components/LoadApp/FullPageLoader";
import { FaChevronLeft } from "react-icons/fa";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import LanguageDrawer from "@/components/Drawers/LanguageDrawer";
import { BiGlobe } from "react-icons/bi";
import { useTranslation } from "react-i18next";

export default function Repay() {
  const { t } = useTranslation();
  const [numPad, setNumPad] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("0");
  const [transactionId, setTransactionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
    null
  );
  const position = useMorphoPosition();
  const borrowedUSD = position?.borrowAssets ?? 0n;
  // const borrowShares = position?.borrowShares ?? 0n;
  const { handleRepay } = useMorpho();
  const client = usePublicClient() as PublicClient<
    Transport,
    typeof worldchain
  >;
  const router = useRouter();
  const [isLanguageDrawerVisible, setIsLanguageDrawerVisible] = useState(false);
  const { isError, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    client,
    appConfig: {
      app_id: process.env.NEXT_PUBLIC_APP_ID!,
    },
    transactionId,
  });

  const { data } = useUSDCBalance();
  const usdcBalance = data ?? 0n;
  // const usdcBalanceString = formatUSD(usdcBalance ?? 0n);

  const maxAmount = borrowedUSD < usdcBalance ? borrowedUSD: usdcBalance;
  // const maxAmountString = formatUSD(maxAmount);

  function updateAmount(amt: string) {
    setAmount(amt);
  }

  function openPad() {
    setNumPad(!numPad);
  }

  useEffect(() => {
    if (numPad && inputElement) {
      inputElement.focus();
    }
  }, [numPad, inputElement]);

  function toggleReview() {
    setNumPad(false);
    setReview(true);
  }

  const handleInputRef = (element: HTMLInputElement | null) => {
    setInputElement(element);
  };

  // console.log("borrowedUSD", borrowedUSD);
  // console.log("borrowShares", borrowShares);

  const onConfirm = async () => {
    try {
      setIsLoading(true);
      let repayAmount = parseUSD(amount);
      // console.log("repayAmount: ", repayAmount);
      if (repayAmount > borrowedUSD) {
        repayAmount = (borrowedUSD * 100n) / 101n; // 1% buffer for price fluctuations
      }
      const txId = await handleRepay(repayAmount.toString());
      setTransactionId(txId);
    } catch (error) {
      console.error("Failed to repay:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConfirmed || isError) {
      router.push("/");
    }
  }, [isConfirmed, isError, router]);

  if (isLoading) {
    return <FullPageLoader message={t('common.loader.repaying')} />;
  }

  const repayInsufficient = Number(amount) < 0.001;
  const repayMoreThanBorrowed = Number(amount) > Number(formatUSD(borrowedUSD));
  const repayMoreThanBalance = Number(amount) > Number(formatUSD(usdcBalance));

  return (
    <div className="relative no-scroll flex flex-col justify-between text-white bg-dash-gray w-full h-screen">
      <div className="absolute z-20 right-[20.5px] top-[38px]">
        <BiGlobe onClick={() => setIsLanguageDrawerVisible(true)} className="text-white text-[24px] cursor-pointer" />
      </div>
      <span className={`w-screen h-screen absolute top-0 left-0 bg-black/50 ${isLanguageDrawerVisible ? "z-10" : "hidden"}`}></span>
      <LanguageDrawer onClose={() => setIsLanguageDrawerVisible(false)} isVisible={isLanguageDrawerVisible} />
      <span className="relative flex justify-center items-center w-full px-[38.5px]">
        <button
          onClick={() => router.back()}
          className="absolute top-0 left-[27px] h-full flex items-center"
        >
          <FaChevronLeft size={20} color="white" />
        </button>
        <h1 className="font-['PolySans'] text-white text-[clamp(12px,5vw,20px)] mt-[36px] text-center max-w-[clamp(200px,70vw,280px)]">
          {t('repay.title')}
        </h1>
      </span>
      <>
        {numPad ? (
          <InputAmount
            inputRef={handleInputRef}
            input={amount}
            closeInput={openPad}
            updateAmount={updateAmount}
            maxAmount={maxAmount || 0n}
          />
        ) : (
          <CircularGauge
            setNumPad={openPad}
            amount={amount}
            updateAmount={updateAmount}
            maxAmount={maxAmount || 0n}
          />
        )}
        {review && (
          <Review
            isRepay={true}
            amount={amount}
            swipeText={t('repay.review.repay')}
            onBack={() => setReview(false)}
            onConfirm={onConfirm}
          />
        )}
        <div className="w-full flex flex-col gap-[calc(3vh)]">
          <span className="mx-6">
            <RepayCard updateMax={updateAmount} />
          </span>
          <span className="flex w-full text-[clamp(13px,4.2vw,17px)]">
            <div onClick={toggleReview} className="h-[calc(7.5vh)] w-full mx-6">
              <ThemePill
                text={
                  repayInsufficient
                    ? t('repay.amount.insufficient')
                    : repayMoreThanBorrowed
                    ? t('repay.amount.exceedBorrowed')
                    : repayMoreThanBalance
                    ? t('repay.amount.exceedBalance')
                    : t('repay.amount.repay') + amount
                }
                disabled={repayInsufficient || repayMoreThanBorrowed || repayMoreThanBalance}
              />
            </div>
          </span>
          <span className="flex flex-col w-full mb-[10vh] text-[clamp(13px,4.2vw,17px)]">
            <div className="mx-24">
              <HollowThemePill
                handleClick={() => openPad()}
                text={t('repay.amount.other')}
              />
            </div>
          </span>
        </div>
      </>
    </div>
  );
}
