"use client";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

interface CounterAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export default function CounterAnimation({
  end,
  start = 0,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
  decimals = 0,
}: CounterAnimationProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (inView) {
      let startTime: number;
      let animationFrame: number;

      const animateCount = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

        // Easing function (easeOutExpo)
        const easeOut = (t: number) => {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };

        const easedProgress = easeOut(progress);
        const currentCount = start + (end - start) * easedProgress;

        setCount(currentCount);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateCount);
        }
      };

      animationFrame = requestAnimationFrame(animateCount);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [inView, start, end, duration]);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.round(num).toString();
  };

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}{formatNumber(count)}{suffix}
    </motion.span>
  );
}
