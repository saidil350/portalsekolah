"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  glowColor?: string;
  glowOpacity?: number;
}

export default function CardHover({
  children,
  className = "",
  scale = 1.05,
  glowColor = "rgba(59, 130, 246, 0.5)",
  glowOpacity = 0.3,
}: CardHoverProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={className}
      initial={false}
      animate={{
        scale: isHovered ? scale : 1,
        boxShadow: isHovered
          ? `0 20px 40px ${glowColor}`
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
    >
      {children}
    </motion.div>
  );
}
