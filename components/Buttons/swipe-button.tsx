"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import Image from 'next/image';
import SwipeButtonIcon from '../icons/swipe-button.svg';
import LoadingIcon from '../icons/loaders/Spinner.gif';
import { useTranslation } from 'react-i18next';

interface SwipeButtonProps {
  onConfirm: () => void;
  text: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const SwipeButton = ({ onConfirm, text, isLoading = false, disabled = false }: SwipeButtonProps) => {
  const [swiped, setSwiped] = useState(false);
  const controls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(0);
  const { t } = useTranslation();
  const [swipeProgress, setSwipeProgress] = useState(1);

  useEffect(() => {
    if (containerRef.current) {
      console.log("containerRef.current", containerRef.current.offsetWidth);
      setMaxDrag(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (isLoading === false) {
      cancelSwipe();
    }
  }, [isLoading]);

  const cancelSwipe = () => {
    setSwipeProgress(1);
    setSwiped(false);
  }

  const handleDrag = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isLoading) return;
    const progress = Math.min(info.offset.x / (maxDrag * 0.8), 1);
    setSwipeProgress(1 - progress);
  }, [disabled, isLoading, maxDrag]);

  const handleSwipe = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isLoading) return;

    const swipeThreshold = maxDrag * 0.8; // 80% of the way
    if (info.offset.x >= swipeThreshold) {
      console.log("info.offset.x: ", info.offset.x);
      setSwiped(true);
      onConfirm();
    } else {
      setSwiped(false); // Reset swiped state if not swiped enough
      setSwipeProgress(1); 
    }
  }, [disabled, isLoading, maxDrag, onConfirm]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full border-y border-t-black/25 border-b-[#0734A9] bg-black/25 rounded-full overflow-hidden"
    >
      <div className='absolute pointer-events-none w-full h-full items-center flex text-white justify-center'>
        {isLoading ? <Image src={LoadingIcon} alt="loading" width={20} height={20} className='absolute'/>: null}
        <p style={{ opacity: swipeProgress }}>{text}</p>
      </div>
      <motion.div 
        className={`size-[50px] rounded-full shadow-lg ${disabled ? 'cursor-not-allowed' : ''}`}
        drag={disabled || swiped ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag - 50 }}
        dragElastic={0.1} 
        dragMomentum={false}
        dragSnapToOrigin={!swiped}
        dragControls={controls}
        onDrag={handleDrag}
        onDragEnd={handleSwipe}
        initial={{ x: 0 }}
        animate={{ x: swiped ? maxDrag - 50 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 50 }}
        onPointerDown={(event) => !disabled && controls.start(event, { snapToCursor: true })}
      >
        <Image
          src={SwipeButtonIcon}
          alt="info"
          width={50}
          height={50}
        />
      </motion.div>
    </div>
  );
};

export default SwipeButton;
