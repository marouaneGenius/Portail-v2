import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Hooks/auth";
import clsx from "clsx";
import React from "react";

// /**
//  * Reusable gradient‑border wrapper
//  * Usage: <GradientBorder>…</GradientBorder>
//  */
// interface GradientBorderProps {
//   /** content inside the bordered box */
//   children: React.ReactNode;
//   /** Tailwind gradient classes – defaults to purple→pink→red */
//   gradient?: string;
//   /** extra classes applied to outer wrapper */
//   className?: string;
//   /** extra classes applied to inner content */
//   innerClassName?: string;
// }

// export const GradientCard: React.FC<GradientBorderProps> = ({
//   children,
//   gradient = "from-purple-500 via-pink-500 to-red-500",
//   className = "",
//   innerClassName = "",
// }) => (
//   <div
//     className={clsx(
//       "relative p-[1px] rounded-2xl bg-gradient-to-br shadow-lg",
//       gradient,
//       className
//     )}
//   >
//     <div className={clsx("rounded-2xl bg-white dark:bg-zinc-900", innerClassName)}>
//       {children}
//     </div>
//   </div>
// );


/** GradientCard – wrapper avec bordure dégradée réutilisable */
export interface GradientCardProps {
  children: React.ReactNode;
  gradient?: string;
  className?: string;
  innerClassName?: string;
}
export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient = "from-purple-500 via-pink-500 to-red-500",
  className = "",
  innerClassName = "",
}) => (
  <div
    className={clsx(
      "relative p-[1px] rounded-2xl bg-gradient-to-br shadow-lg",
      gradient,
      className
    )}
  >
    <div className={clsx("rounded-2xl bg-white dark:bg-zinc-900", innerClassName)}>
      {children}
    </div>
  </div>
);
