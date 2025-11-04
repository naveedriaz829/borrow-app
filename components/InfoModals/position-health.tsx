"use client";
import { IoCloseOutline } from "react-icons/io5";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function InfoPositionHealth({
  trigger,
  isVisible,
}: {
  trigger: Dispatch<SetStateAction<boolean>>;
  isVisible: boolean;
}) {
  const { t } = useTranslation();

  const handleClose = (e?: React.MouseEvent) => {
    // Prevent event propagation to avoid conflicts with drag handlers
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Wait for animation to complete before calling trigger
    setTimeout(() => {
      trigger(false);
    }, 100);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isVisible ? 0 : "100%" }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(event, info) => {
        if (info.offset.y > 100) {
          handleClose();
        }
      }}
      className="fixed inset-0 bg-[#161616] h-full rounded-t-[20px] z-10 font-sans w-full text-[#C7C7CC] text-[19px] font-light mx-auto flex flex-col p-6 gap-4"
    >
      <button
        className="absolute top-[15px] right-[14px] rounded-full bg-white/10 size-8 flex items-center justify-center z-20"
        onClick={handleClose}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <IoCloseOutline size={20} color="white" />
      </button>

      <span className="relative h-full overflow-scroll no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header Section */}
        <h1 className="font-['PolySans'] text-2xl font-bold py-5 text-white">
          {t("positionHealth.title")}
        </h1>
        <p className="text-md font-light">{t("positionHealth.intro")}</p>

        <h4 className="font-['PolySans'] text-md font-bold py-4 text-white">
          {t("positionHealth.categories.title")}
        </h4>
        <div className="space-y-10">
          {/* Good - Safe Zone */}
          <div className="rounded-lg">
            <span className="flex text-lg font-semibold gap-2 text-white">
              {" "}
              <Image
                src="bulletpoints/safe.svg"
                alt="caution"
                width={15}
                height={15}
              />
              {t("positionHealth.categories.good.title")}
            </span>
            <p className="">
              {t("positionHealth.categories.good.description")}
            </p>
          </div>

          {/* Medium - Caution Zone */}
          <div className="rounded-lg">
            <span className="flex text-lg font-semibold gap-2 text-white">
              {" "}
              <Image
                src="bulletpoints/caution.svg"
                alt="caution"
                width={15}
                height={15}
              />
              {t("positionHealth.categories.medium.title")}
            </span>
            <p className="">
              {t("positionHealth.categories.medium.description")}
            </p>
          </div>

          {/* Low - At Risk */}
          <div className="rounded-lg">
            <span className="flex gap-2 text-lg font-semibold text-white">
              {" "}
              <Image
                src="bulletpoints/risk.svg"
                alt="caution"
                width={15}
                height={15}
              />{" "}
              {t("positionHealth.categories.low.title")}
            </span>
            <p className="">{t("positionHealth.categories.low.description")}</p>
          </div>
        </div>

        {/* How to Maintain a Healthy Position */}
        <div className="mt-6">
          <h3 className="font-['PolySans'] text-lg font-semibold text-white">
            {t("positionHealth.maintenance.title")}
          </h3>
          <ul className="diamond-list pl-5  mt-2 space-y-1">
            {(
              t("positionHealth.maintenance.tips", {
                returnObjects: true,
              }) as string[]
            ).map((tip: string, index: number) => (
              <li key={index} className="marker:text-white">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Final Section */}
        <p className="  mt-4">{t("positionHealth.conclusion")}</p>
      </span>
    </motion.div>
  );
}
