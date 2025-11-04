"use client";
import { useState, useEffect } from "react";
import InputAmount, { InputType } from "./modal-input";
import { FaChevronLeft } from "react-icons/fa";
import Image from "next/image";
import WLDLogo from "@/components/icons/Logo/wld-logo.svg";
import { useMorpho } from "@/hooks/useMorpho";
import { useWLDBalance } from "@/hooks/useWLDBalance";
import { useWLDPrice } from "@/hooks/useWLDPrice";
import { formatWLD } from "@/lib/format";
import { useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";
import Review from "./modal-review";
import { useTransactionState } from "@/contexts/TransactionContext";
import ErrorCard from "../../Cards/ErrorCard";
import { useTranslation } from "react-i18next";

const Deposit = ({ closeDeposit }: { closeDeposit: () => void }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("0");
  const [openPad, setOpenPad] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const { handleSupplyCollateral } = useMorpho();
  const { data: wldBalance } = useWLDBalance();
  const { data: wldPrice } = useWLDPrice();

  const router = useRouter();
  const { updateTxnID, updateTxnWLDAmount, updateTxnUSDAmount } = useTransactionState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  
  const wldBalanceInUSD =
    (Number(wldPrice || 0n) / 10e23) * Number(formatEther(((wldBalance || 0n) * 100n)/101n));
  const maxDepositWLD = formatWLD(((wldBalance || 0n)*100n)/101n)

  console.log("amount, maxDepositWLD: ",  Number(amount), Number(maxDepositWLD));
  const isGreaterThanBalance = Number(amount) > Number(maxDepositWLD);
  const isGreaterThanZero = Number(amount) > 0;

  function updateAmount(amt: string) {
    setAmount(amt);
    setIsError(false);
  }

  function openReview() {
    if (isGreaterThanBalance || !isGreaterThanZero) {
      setIsError(true);
      return;
    } else {
      setIsError(false);
    }

    if (!isGreaterThanBalance) {
      setReview(true);
    }
  }

  async function onConfirm() {
    try {
      setIsLoading(true);
      const txnHash = await handleSupplyCollateral(
        parseEther(amount).toString()
      );
      console.log("handleSupply txn: ", txnHash);
      updateTxnID(txnHash);
      updateTxnWLDAmount(amount);
      updateTxnUSDAmount(wldBalanceInUSD.toFixed(2));
      router.push("/Deposit");
    } catch (error) {
      console.error("Failed to deposit:", error);
      setIsLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-30 h-screen w-screen bg-[#161616]">
      {review && (
        <Review
          amount={amount}
          onBack={() => setReview(false)}
          onConfirm={() => onConfirm()}
          swipeText={t('deposit.amount.deposit')}
          isLoading={isLoading}
        />
      )}
      <span className="flex flex-col justify-between h-full w-full">
        <span className="flex flex-col justify-between items-center w-full">
          <span className="relative flex justify-center items-center w-full py-[24px] px-[38.5px]">
            <button
              onClick={closeDeposit}
              className="absolute top-0 left-[27px] h-full flex items-center"
            >
              <FaChevronLeft size={20} color="white" />
            </button>
            <h1 className="font-['PolySans'] text-white text-[19px] text-center">
              {t('deposit.title')}
            </h1>
          </span>
          <span className="h-[77px] w-full" />
          <InputAmount
            input={amount}
            closeInput={() => setOpenPad(!openPad)}
            updateAmount={updateAmount}
            inputType={InputType.Deposit}
          />
          <span className="px-[20px] flex justify-between items-center w-full">
            <div className="text-secondary-white text-[15px] h-full">
              <h3 className="h-full text-[#AEAEB2]">{t('deposit.amount.available')}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col text-end">
                <span className=" text-secondary-white text-[17px]">
                  {maxDepositWLD} WLD
                </span>
                <span className="text-secondary-gray text-[13px] text-[#AEAEB2]">
                  ${wldBalanceInUSD.toFixed(2)} USD 
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

        <div className="h-full place-content-end pb-[44px]">
          {isError && isGreaterThanBalance && (
            <ErrorCard
              title={t('deposit.error.insufficientBalance.title')}
              message={t('deposit.error.insufficientBalance.message')}
            />
          )}

          {isError && !isGreaterThanZero && (
            <ErrorCard
              title={t('deposit.error.invalidAmount.title')}
              message={t('deposit.error.invalidAmount.message')}
            />
          )}
        </div>
        <span className="px-[24px] pb-[60px]">
          <button
            onClick={openReview}
            className={`${
              isError ? "bg-white/10" : "bg-white"
            }  text-bold rounded-full w-full py-[14.5px]`}
            disabled={isError}
          >
            <h1 className="text-center text-black text-[19px]">{t('deposit.amount.review')}</h1>
          </button>
        </span>
      </span>
    </div>
  );
};

export default Deposit;
