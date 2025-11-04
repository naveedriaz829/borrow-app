"use client";
import { useMemo, useState, useContext, useEffect } from "react";
import Image from "next/image";
import WLDLogo from "../../components/icons/Logo/wld-logo.svg";
import BorrowLogo from "../../components/icons/Logo/borrow-logo.svg";
import { BsArrowDown } from "react-icons/bs";
import HollowThemePill from "@/components/Buttons/hollow-theme-pill";
import { FiArrowUpRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTransactionState } from "@/contexts/TransactionContext";
import { FaCheck } from "react-icons/fa";
import { TbCancel } from "react-icons/tb";
import { FiCopy } from "react-icons/fi";
import WalletCircle from "@/components/icons/Logo/account.svg";
import { useTranslation } from "react-i18next";
import FullPageLoader from "@/components/LoadApp/FullPageLoader";

export default function Deposit() {
  const { t } = useTranslation();
  const [tryAgain, setTryAgain] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isLoading, isSuccess, error, txnWLDAmount, txnUSDAmount, receipt } =
    useTransactionState();

  const txnHash = useMemo(() => receipt ? receipt?.transactionHash : null, [receipt]);

  useEffect(() => {
    if (error) {
      setTryAgain(true);
    }
  }, [error]);
  
  const errorMessage = useMemo(() => {
    return {
      title: error?.name || "Error",
      message: error?.message || "An error occurred while processing your transaction.",
    };
  }, [error]);

  const shortTxnHash = useMemo(() => {
    if (!txnHash) return "Pending...";
    return `${txnHash.slice(0, 6)}...${txnHash.slice(-4)}`;
  }, [txnHash]);
  const router = useRouter();

  if (isLoading) {
    return <FullPageLoader message={t('common.loader.depositing')} />;
  }

  return (
    <div className="no-scroll flex flex-col justify-between text-white bg-black w-full h-screen">
      <span className="flex flex-col">
        <div className={`flex flex-col justify-between h-[424px] mx-[12px] bg-[#161616] border-t-[1px] ${isSuccess? "rounded-b-none": ""} ${error ? "border-[#FF6961] rounded-b-none" : "border-[#3A3A3C]"} rounded-[20px] relative`}>
          <span className="absolute top-[18px] right-[17px]">
            <span className="">
              <Image src={WLDLogo} alt="WLD Logo" width={28} height={28} />
            </span>
          </span>
          <span className="flex flex-col h-full w-full justify-between py-[25px] font-light">
            <div className="w-full flex text-[15px] flex-col justify-center items-center gap-[8px]">
              <Image src={WalletCircle} alt="Borrow Logo" width={80} height={80} />
              <h3>{t('deposit.page.from')}</h3>
            </div>
            <div className="w-full text-[#8E8E93] flex flex-col justify-center items-center">
              <BsArrowDown
                className="w-[22px] h-[22px]"
                width={22}
                height={22}
                color={error ? "#FF6961" : "#8E8E93"}
              />
            </div>
            <div className="w-full flex text-[15px] flex-col justify-center items-center gap-[8px]">
              <Image
                src={BorrowLogo}
                alt="Borrow Logo"
                width={80}
                height={80}
              />
              <h3>{t('deposit.page.to')}</h3>
            </div>
          </span>
          <span className="flex text-white flex-col bg-[#1C1C1E] mx-[9px] mb-[12px] rounded-[9px] border border-[#2C2C2E]">
            <span className="mx-[15px] my-[12px]">
              <div className="w-full flex justify-between">
                <h4 className="text-[#8D71FF]">
                  {!receipt ? t('deposit.page.status.pending') : error ? t('deposit.page.status.failed') : t('deposit.page.status.success')}
                </h4>
              </div>
              <div className="w-full flex justify-between font-['PolySans']">
                <h2 className="">{t('deposit.page.currency')}</h2>
                <h2 className="">{txnWLDAmount}</h2>
              </div>
              <div className="w-full flex justify-between text-[#AEAEB2] text-[15px]">
                <p className="">{new Date().toLocaleDateString()}</p>
                <p className="">${txnUSDAmount}</p>
              </div>
            </span>
          </span>
        </div>
        {receipt && receipt.status === "success" && (
          <span className="flex mx-[12px] h-[37px] bg-theme-1 items-center justify-center rounded-b-[20px]">
            <div className="flex items-center gap-[10px] text-[15px] font-medium">
              <FaCheck /> {t('deposit.page.status.success')}
            </div>
          </span>
        )}
        { error &&
          <span className="flex mx-[12px] h-[56px] bg-[#FF6961] text-black rounded-b-[20px]">
            <div className="flex items-center justify-between w-full text-[15px] font-medium ml-[24px] mr-[17.5px]">
              <div className="flex flex-col">
                <h3>{errorMessage.title}</h3>
                <p className="font-light">{errorMessage.message}</p>
              </div>
              <TbCancel size={20} className="w-[20px] h-[20px]" />
            </div>
          </span>
        }
        <span className="flex justify-between pt-[12px] mx-[24px] text-[15px] text-[#AEAEB2]">
          <p>{t('deposit.page.transaction.id')}</p>
          <div className="relative">
            <button 
              className="flex items-center justify-center gap-[4px] hover:text-white transition-colors"
              onClick={() => {
                if (txnHash) {
                  navigator.clipboard.writeText(txnHash);
                  setShowTooltip(true);
                  setTimeout(() => setShowTooltip(false), 2000);
                }
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {shortTxnHash} <FiCopy className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#1C1C1E] text-white text-xs rounded whitespace-nowrap">
                {txnHash ? t('deposit.page.transaction.copy') : t('deposit.page.transaction.noHash')}
              </div>
            )}
          </div>
        </span>
      </span>
      <span className="mx-[24px]">
        <span className="flex flex-col gap-[18px] justify-between text-white">
          {tryAgain ? (
            <div className="flex flex-col gap-[18px]">
              <button
                className="bg-theme-1 h-[45px] rounded-full w-full"
                onClick={() => {
                  setTryAgain(!tryAgain);
                  router.push("/")
                }}
              >
                {t('deposit.page.actions.tryAgain')}
              </button>
              <HollowThemePill
                handleClick={() => {
                  router.push("/")
                }}
                text={t('deposit.page.actions.viewPosition')}
              ></HollowThemePill>
            </div>
          ) : (
            <HollowThemePill
              handleClick={() => {
                router.push("/")
              }}
              text={t('deposit.page.actions.viewPosition')}
            ></HollowThemePill>
          )}
        </span>
        <span className="flex flex-col gap-[18px] justify-between pb-[48px] pt-[24px]">
          <button
            onClick={() =>
              window.open(`https://worldscan.org/tx/${txnHash}`, "_blank")
            }
            className="flex w-full items-center text-[13px] text-[#4898F3] justify-center"
          >
            {t('deposit.page.transaction.viewDetails')} <FiArrowUpRight />
          </button>
        </span>
      </span>
    </div>
  );
}
