"use client";
import WLDLogo from "@/components/icons/Logo/wld-logo.svg";
import { useMorpho } from "@/hooks/useMorpho";
import { useMorphoPosition } from "@/hooks/useMorphoPosition";
import { useWLDPrice } from "@/hooks/useWLDPrice";
import { formatWLD, parseUSD } from "@/lib/format";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { parseEther } from "viem";
import InputAmount, { InputType } from "./modal-input";
import Review from "./modal-review";
import { useTransactionState } from "@/contexts/TransactionContext";
import ErrorCard from "../../Cards/ErrorCard";
import { useTranslation } from "react-i18next";

const Withdraw = ({ closeWithdraw }: { closeWithdraw: () => void }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("0");
  const [openPad, setOpenPad] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const { handleWithdrawCollateral } = useMorpho();
  const position = useMorphoPosition();
  const { updateTxnID, updateTxnWLDAmount, updateTxnUSDAmount } = useTransactionState();
  const router = useRouter();
  const { data: wldPrice } = useWLDPrice();
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // console.log({ wldPrice });

  const maxWithdrawAmountWLD = position?.withdrawableCollateral || 0n;
  const maxWithdrawAmountWLDUI = formatWLD(maxWithdrawAmountWLD);
  const maxWithdrawAmountUSDUI = (
    (Number(maxWithdrawAmountWLDUI) * Number(wldPrice || 0n)) /
    10e23
  ).toFixed(2);

  const wldInputAmountInUSD = (
    (Number(wldPrice || 0n) / 10e23) *
    Number(amount)
  ).toFixed(4);
  console.log("wldInputAmountInUSD: ", wldInputAmountInUSD);

  function updateAmount(amt: string) {
    setAmount(amt);
    setIsError(false);
  }

  async function onConfirm() {
    try {
      setIsLoading(true);
      const txnHash = await handleWithdrawCollateral(
        parseEther(amount).toString()
      );
      updateTxnID(txnHash);
      updateTxnWLDAmount(amount);
      updateTxnUSDAmount(wldInputAmountInUSD);
      router.push("/Withdraw");
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setIsLoading(false);
    }
  }

  const withdrawInsufficient = parseUSD(wldInputAmountInUSD) < 10000n; //  Number(wldInputAmountInUSD) < 0.001;
  const collateralInsufficient = parseUSD(maxWithdrawAmountUSDUI) < 10000n; //  Number(wldInputAmountInUSD) < 0.001;

  function openReview() {
    if (withdrawInsufficient) {
      setIsError(true);
      return;
    } else {
      setIsError(false);
    }
    setReview(true);
  }
  return (
    <div className="fixed inset-0 z-30 h-screen w-screen bg-[#161616]">
      {review && (
        <Review
          amount={amount}
          onBack={() => setReview(false)}
          onConfirm={() => onConfirm()}
          swipeText={t('withdraw.amount.withdraw')}
          isWithdraw={true}
          isLoading={isLoading}
        />
      )}
      <span className="flex flex-col justify-between h-full w-full">
        <span className="flex flex-col justify-between items-center w-full">
          <span className="relative flex justify-center items-center w-full py-[24px] px-[38.5px]">
            <button
              onClick={closeWithdraw}
              className="absolute top-0 left-[27px] h-full flex items-center"
            >
              <FaChevronLeft size={20} color="white" />
            </button>
            <h1 className="font-['PolySans'] text-white text-[19px] text-center">
              {t('withdraw.title')}
            </h1>
          </span>
          <span className="h-[77px] w-full" />
          <InputAmount
            input={amount}
            closeInput={() => setOpenPad(!openPad)}
            updateAmount={updateAmount}
            inputType={InputType.Withdraw}
          />
          
          <span className="px-[20px] flex justify-between items-center w-full">
            <div className="text-secondary-white text-[15px] h-full">
              <h3 className="h-full text-[#AEAEB2]">{t('withdraw.amount.withdraw')}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col text-end">
                <span className="text-secondary-white text-[17px]">
                  {Number(amount).toFixed(2)} WLD
                </span>
                <span className="text-secondary-gray text-[13px] text-[#AEAEB2]">
                  ${wldInputAmountInUSD.slice(0,-2)} USD
                </span>
              </div>
              <div>
                <Image
                  src={WLDLogo} // Replace with actual logo path
                  alt="WLD"
                  height={35}
                  width={35}
                />
              </div>
            </div>
          </span>
        </span>

        <div className="h-full place-content-end pb-[48px]">
          {isError && collateralInsufficient && (
            <ErrorCard
              title={t('withdraw.error.insufficientCollateral.title')}
              message={t('withdraw.error.insufficientCollateral.message')}
            />
          )}
          {isError && withdrawInsufficient && !collateralInsufficient && (
            <ErrorCard
              title={t('withdraw.error.insufficientWithdrawal.title')}
              message={t('withdraw.error.insufficientWithdrawal.message')}
            />
          )}
        </div>

        <span className="px-[24px] pb-[60px]">
          <button
            onClick={openReview}
            disabled={isError}
            className={`text-bold rounded-full w-full py-[14.5px] ${
              isError ? "bg-white/10" : "bg-white "
            }`}
          >
            <h1 className="text-center text-black text-[19px]">{t('withdraw.amount.review')}</h1>
          </button>
        </span>
      </span>
    </div>
  );
};

export default Withdraw;
