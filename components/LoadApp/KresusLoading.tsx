"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { memo } from "react";

export const KresusLoading = memo(
  ({
    loadingText
  }: {
    loadingText: string;
  }) => {
    return (
      <>
        <div className="relative w-full h-full flex flex-col pb-24 items-center justify-center">
          <DotLottieReact
            src="https://lottie.host/47421221-5cb1-4f3f-a37f-62f6e868da2b/GaHrN6FLDC.lottie"
            loop
            autoplay
            style={{
              width: "100%",
              height: "100%",
            }}
            className="w-[402px] h-[402px]"
          />
          <div className="text-center pt-4">
            <p
              className="text-[20px] font-bold animate-text-color"
            >
              {loadingText}
            </p>
          </div>
          <style jsx global>{`
            @keyframes textColor {
              16.5%, 100% { color: #8D71FF; }
              50% { color: #1FB8DD; }
              83.5% { color: #FF7EB0; }
            }
            .animate-text-color {
              animation: textColor 6s linear infinite;
            }
          `}</style>
        </div>
      </>
    );
  }
);

KresusLoading.displayName = 'KresusLoading';