import React from 'react';
import { motion, useTransform, MotionValue, useMotionValue, useAnimationFrame } from 'framer-motion';

export interface NemoMascotProps {
  className?: string;
  scrollYProgress?: MotionValue<number>;
}

export const NemoMascot: React.FC<NemoMascotProps> = ({ className, scrollYProgress }) => {
  const internalTime = useMotionValue(0);
  const isScrollControlled = scrollYProgress !== undefined;
  
  const progress = isScrollControlled ? scrollYProgress : internalTime;

  useAnimationFrame((time) => {
    if (!isScrollControlled) {
      // Loop from 0 to 1 every 6 seconds (6000ms)
      internalTime.set((time % 6000) / 6000);
    }
  });

  const eyeX = useTransform(
    progress,
    [0, 0.15, 0.2, 0.4, 0.45, 0.5, 0.7, 0.75, 0.8, 1],
    [0, 0, -6, -6, -6, 6, 6, 6, 0, 0]
  );

  const eyeY = useTransform(
    progress,
    [0, 0.15, 0.2, 0.4, 0.45, 0.5, 0.7, 0.75, 0.8, 1],
    [0, 0, -4, -4, -4, -4, -4, -4, 0, 0]
  );
  
  const eyeHeight = useTransform(
    progress,
    [0, 0.1, 0.125, 0.15, 0.2, 0.4, 0.425, 0.45, 0.5, 0.7, 0.725, 0.75, 0.8, 1],
    [22, 22, 0, 0, 22, 22, 0, 0, 22, 22, 0, 0, 22, 22]
  );

  const eyeRectY = useTransform(
    progress,
    [0, 0.1, 0.125, 0.15, 0.2, 0.4, 0.425, 0.45, 0.5, 0.7, 0.725, 0.75, 0.8, 1],
    [28, 28, 39, 39, 28, 28, 39, 39, 28, 28, 39, 39, 28, 28]
  );

  const eyelidsOpacity = useTransform(
    eyeHeight,
    [0, 4, 10],
    [1, 1, 0]
  );

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" fill="transparent" />
      <rect x="15" y="15" width="70" height="70" rx="16" ry="16" fill="#0c0d0e" />
      
      <motion.g style={{ x: eyeX, y: eyeY }}>
        <motion.rect x="27" style={{ y: eyeRectY, height: eyeHeight }} width="8" rx="4" ry="4" fill="#ffffff" />
        <motion.rect x="41" style={{ y: eyeRectY, height: eyeHeight }} width="8" rx="4" ry="4" fill="#ffffff" />
        
        <motion.g style={{ opacity: eyelidsOpacity }}>
          <rect x="25" y="37" width="12" height="4" rx="2" fill="#ffffff" />
          <rect x="39" y="37" width="12" height="4" rx="2" fill="#ffffff" />
        </motion.g>
      </motion.g>
    </svg>
  );
};
