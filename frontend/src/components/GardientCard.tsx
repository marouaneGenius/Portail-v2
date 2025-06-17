import clsx from "clsx";
import React from "react";

interface GradientBorderProps {
  children: React.ReactNode;
  gradient?: string; // ignoré ici mais laissé pour compatibilité
  className?: string;
  innerClassName?: string;
}

export const GradientCard: React.FC<GradientBorderProps> = ({
  children,
  className = "",
  innerClassName = "",
}) => (
  <div
    className={clsx(
      "relative p-[1px] rounded-2xl bg-[#333333]", // Mister Anthracite
      className
    )}
  >
    <div className={clsx("rounded-2xl bg-[#FFFFFF]", innerClassName)}> {/* Dat White */}
      {children}
    </div>
  </div>
);
