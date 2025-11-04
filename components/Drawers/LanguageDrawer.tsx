"use client";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa6";

function LanguageDrawer({
  onClose,
  isVisible,
}: {
  onClose: () => void;
  isVisible: boolean;
}) {
  const { t, i18n } = useTranslation();

  const handleClose = () => {
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 0);
  };
  return (
    <>
      {/* Overlay background */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-gray bg-opacity-5"
          onClick={handleClose}
        />
      )}
      
      {/* Language drawer */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isVisible ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(event, info) => {
          if (info.offset.y > 100) {
            handleClose();
          }
        }}
        className="font-sans fixed bottom-0 inset-x-0 z-50 flex justify-center items-center bg-gradient-to-r from-[#7D0BF4] via-[#1A26E7] to-[#0D4BEF] w-full text-white rounded-t-[20px] rounded-b-[20px]"
      >
      <div className="absolute top-4 w-[50px] h-[3px] rounded-full" />
      <div className="text-[19px] font-light h-full w-full rounded-t-[20px] rounded-b-[20px] mt-[1px] bg-[#161616]">
        <div className="flex flex-col justify-between items-center mx-[24px]">
          <span className="relative flex flex-col w-full items-center">
            <div className="absolute top-4 w-[50px] h-[3px] rounded-full bg-[#3A3A3C]" />
            <h1 className="text-[15px] pb-[24px] pt-[34px]">
              {t("language.title")}
            </h1>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#2C2C2E]" />
            <div className="absolute bottom-0 w-full h-[0.5px] mx-[9px] bg-[#3A3A3C]" />
          </span>
          {/* <div className="relative w-full h-full"> */}
          <ul className="w-full pb-[48px]">
            <button
              onClick={() => {
                i18n.changeLanguage("en");
                handleClose();
              }}
              className="flex items-center justify-between p-[15px] w-full"
            >
              <span>English</span>

              <FaCheck
                className={`${
                  i18n.language === "en" ? "text-[#5CFFAB]" : "invisible"
                }`}
              />
            </button>
            <button
              onClick={() => {
                i18n.changeLanguage("es");
                handleClose();
              }}
              className="flex items-center justify-between p-[15px] w-full"
            >
              <span>Spanish</span>

              <FaCheck
                className={`${
                  i18n.language === "es" ? "text-[#5CFFAB]" : "invisible"
                }`}
              />
            </button>
          </ul>
          {/* </div> */}
        </div>
      </div>
    </motion.div>
    </>
  );
}

export default LanguageDrawer;
