"use client";
import SwipeButton from "@/components/Buttons/swipe-button";
import BorrowLogo from "@/components/icons/Logo/borrow-logo.svg";
import WLDLogo from "@/components/icons/Logo/wld-logo.svg";
import Image from "next/image";
import { BiChevronLeft } from "react-icons/bi";
import { BsArrowDown } from "react-icons/bs";
// import { TbLayersLinked } from "react-icons/tb";
// import GradientWalletCircle from "@/components/Account/WalletCircle";
import { useWLDPrice } from "@/hooks/useWLDPrice";
import WalletCircle from "@/components/icons/Logo/account.svg";
// import { formatEther } from "viem";
import { useTransactionState } from "@/contexts/TransactionContext";
import { useTranslation } from "react-i18next";

function Review({
  amount,
  onBack,
  swipeText,
  onConfirm,
  isWithdraw = false,
  isLoading = false,
}: {
  amount: string;
  onBack: () => void;
  swipeText: string;
  onConfirm: () => void;
  isWithdraw?: boolean;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const { data: wldPrice } = useWLDPrice();
  const wldBalanceInUSD =
    ((Number(wldPrice || 0n) / 10e23) * Number(amount)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-clip-border bg-dash-gray w-full h-screen">
      <span className="relative pb-[calc(4vh)]">
        <button className="absolute p-6" onClick={onBack}>
          <BiChevronLeft size={30} />
        </button>
        <h3 className="text-center font-['PolySans'] text-[clamp(18px,5.9vw,24px)] pt-[calc(6.7vh)]">
          {t('review.modal.title')}
        </h3>
        <p className="text-center text-[clamp(11px,3.7vw,15px)] px-[24px] text-[#AEAEB2]">
          {isWithdraw
            ? t('review.modal.description.withdraw', { amount })
            : t('review.modal.description.deposit')}
        </p>
      </span>
      <div className={`h-full justify-between"}`}>
        <div>
          <span className="flex flex-col justify-center items-center bg-theme-1 mx-[12px] rounded-[20px] ">
            <span className="flex flex-col justify-center items-center h-auto w-full rounded-[20px] mt-[1px] bg-[#1C1C1E] shadow-[0px_22px_22px_0px_rgba(0,0,0,0.33)]">
              <div className="flex flex-col justify-center items-center p-[clamp(14px,5vw,20px)] w-full">
                <span className="flex justify-between items-center w-full">
                  <h5 className="text-[clamp(13px,4.7vw,19px)] h-full text-[#AEAEB2]">
                    {isWithdraw ? t('review.modal.action.withdraw') : t('review.modal.action.deposit')}
                  </h5>
                  <div className="flex flex-col text-end">
                    <h5 className="text-[clamp(14px,4.9vw,20px)] font-['PolySans'] h-full text-white">
                      {amount} WLD
                    </h5>
                    <h5 className="text-[clamp(13px,4.7vw,19px)] h-full text-[#AEAEB2]">
                      {wldBalanceInUSD} USD
                    </h5>
                  </div>
                </span>
              </div>
              <span className="bg-black w-full h-[2px]" />
              <div className="flex flex-col justify-center items-center w-full">
                <span className="flex flex-col h-full w-full justify-between py-[calc(3.7vh)] px-[clamp(12px,4vw,18px)] font-light">
                  <div className="w-full flex text-[clamp(11px,3.7vw,15px)] justify-center items-center">
                    <div className="flex w-full flex-col items-start">
                      <h3 className="text-start text-[clamp(11px,3.7vw,15px)] text-[#AEAEB2]">
                        {t('review.modal.transaction.from')}
                      </h3>
                      <h3 className="text-start text-[clamp(13px,4.7vw,19px)]">
                        {isWithdraw ? t('review.modal.transaction.wldLending') : t('review.modal.transaction.myWallet')}
                      </h3>
                    </div>
                    {isWithdraw ? (
                      <Image
                        src={BorrowLogo}
                        alt="Borrow Logo"
                        className="size-[50px]"
                      />
                    ) : (
                      <Image
                        src={WalletCircle}
                        alt="Wallet Circle"
                        className="size-[50px]"
                      />
                    )}
                  </div>
                  <div className="w-full py-[calc(2.1vh)] text-white flex flex-col justify-start items-start">
                    <BsArrowDown
                      className="w-[clamp(18px,6.2vw,22px)] h-[clamp(18px,6.2vw,22px)]"
                    />
                  </div>
                  <div className="w-full flex text-[clamp(11px,3.7vw,15px)] justify-center items-center gap-[8px]">
                    <div className="flex w-full flex-col items-start">
                      <h3 className="text-start text-[clamp(11px,3.7vw,15px)] text-[#AEAEB2]">
                        {t('review.modal.transaction.to')}
                      </h3>
                      <h3 className="text-start text-[clamp(13px,4.7vw,19px)]">
                        {isWithdraw ? t('review.modal.transaction.myWallet') : t('review.modal.transaction.wldLending')}
                      </h3>
                    </div>
                    {isWithdraw ? (
                      <Image
                        src={WalletCircle}
                        alt="Wallet Circle"
                        width={50}
                        height={50}
                      />
                    ) : (
                      <Image
                        src={BorrowLogo}
                        alt="Borrow Logo"
                        width={50}
                        height={50}
                      />
                    )}
                  </div>
                </span>
              </div>
            </span>
          </span>
          <span className="w-full flex flex-col text-[#AEAEB2] text-[clamp(11px,3.7vw,15px)] px-[clamp(15px,5.2vw,30px)] py-[clamp(10px,2.7vH,20px)] gap-[clamp(6px,2.1vw,12px)]">
            <div className="flex justify-between items-center w-full">
              <h3>{t('review.modal.network.title')}</h3>
              <div className="flex items-center gap-[7px]">
                <Image src={WLDLogo} alt="WLD Logo" width={20} height={20} />
                <h3>{t('review.modal.network.worldChain')}</h3>
              </div>
            </div>
            {isWithdraw ? (
              <>
                <div className="flex justify-between items-center w-full">
                  <h3>{t('review.modal.fees.withdrawal')}</h3>
                  <h3>{t('review.modal.fees.amount')}</h3>
                </div>
                <div className="flex justify-between w-full">
                  <h3 className="h-full">{t('review.modal.total.title')}</h3>
                  <div className="text-white flex flex-col text-end">
                    <p>{t('review.modal.total.amount', { amount })}</p>
                    <p className="text-[#AEAEB2]">{t('review.modal.total.usd', { amount: wldBalanceInUSD })}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center w-full">
                <h3>{t('review.modal.fees.title')}</h3>
                <h3>0.00 WLD</h3>
              </div>
            )}
          </span>
        </div>
      </div>
      <div className="h-1/6 flex flex-col">
        <span className="w-full h-[1px] bg-gradient-to-r from-[#7D0BF4] via-[#1A26E7] to-[#0D4BEF]"></span>
        <span className="bg-theme-2 h-full flex justify-center items-start">
          <div className="mt-[calc(2vh)] text-[clamp(13px,4.7vw,19px)] mb-[calc(7vh)] w-full px-[24px]">
            <SwipeButton text={swipeText} onConfirm={onConfirm} isLoading={isLoading} />
          </div>
        </span>
      </div>
    </div>
  );
}

export default Review;
