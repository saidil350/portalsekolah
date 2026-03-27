"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface FloatingShape {
  id: number;
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

export default function FloatingElements() {
  const shapes: FloatingShape[] = useMemo(
    () => [
      {
        id: 1,
        x: "10%",
        y: "20%",
        size: 60,
        duration: 6,
        delay: 0,
        color: "rgba(59, 130, 246, 0.1)",
        opacity: 0.3,
      },
      {
        id: 2,
        x: "80%",
        y: "15%",
        size: 80,
        duration: 8,
        delay: 1,
        color: "rgba(139, 92, 246, 0.1)",
        opacity: 0.3,
      },
      {
        id: 3,
        x: "70%",
        y: "60%",
        size: 50,
        duration: 7,
        delay: 2,
        color: "rgba(16, 185, 129, 0.1)",
        opacity: 0.3,
      },
      {
        id: 4,
        x: "20%",
        y: "70%",
        size: 70,
        duration: 9,
        delay: 0.5,
        color: "rgba(249, 115, 22, 0.1)",
        opacity: 0.3,
      },
      {
        id: 5,
        x: "50%",
        y: "40%",
        size: 40,
        duration: 5,
        delay: 1.5,
        color: "rgba(236, 72, 153, 0.1)",
        opacity: 0.3,
      },
    ],
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full blur-2xl"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            opacity: shape.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
