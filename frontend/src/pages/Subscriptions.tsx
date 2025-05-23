import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Hooks/auth";
import clsx from "clsx";
import React, { useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import { HiOutlineBadgeCheck } from "react-icons/hi";

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

// Data tiers (images dans /public/images)
const tiers = [
  {
    id: "stage",
    title: "Stage d'été",
    img: "/images/stage-ete.svg",
    gradient: "from-rose-400 to-orange-400",
  },
  {
    id: "annuel",
    title: "Annuel",
    img: "/images/annuel.svg",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    id: "preinscription",
    title: "Pré‑inscription",
    img: "/images/pre-inscription.svg",
    gradient: "from-emerald-400 to-lime-400",
  },
] as const;

type TierId = typeof tiers[number]["id"];

export default function Subscriptions() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const [selected, setSelected] = useState<TierId[]>([]);
  const toggle = (id: TierId) => {
    setSelected((s) => (s.includes(id) ? s.filter((t) => t !== id) : [...s, id]));
  };
  const isSelected = (id: TierId) => selected.includes(id);

  const handleNext = () => {
    console.log("Tiers choisis", selected);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-4 px-4 space-y-8">
      <GradientCard className="w-full w-4/5" innerClassName="p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Les abonnements</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              onClick={() => toggle(tier.id)}
              className="select-none"
            >
              <Card className={clsx(
                  "overflow-hidden cursor-pointer group p-2 shadow-lg transition-all",
                  isSelected(tier.id) ? "border-2 border-green-500 " : " text-gray-300"
                )}>
                <div className="relative h-96 w-full">
                  <img
                    src={tier.img}
                    alt={tier.title}
                    className="absolute inset-0 h-full w-full object-cover scale-110 transition-transform duration-500 group-hover:scale-100"
                  />
                  <div
                    className={clsx(
                      "absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-screen",
                      tier.gradient
                    )}
                  />
                </div>
                <CardContent className="py-6 text-center">
                  <h2 className="text-2xl font-semibold">{tier.title}</h2>
                </CardContent>
              </Card>

              {/* Icone sélection */}
              <div className="flex justify-center mt-3">
                <div
                  className={clsx(
                    "h-14 w-14 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected(tier.id)
                      ? "bg-green-100 border-green-500"
                      : "bg-white border-gray-300"
                  )}
                >
                  <HiOutlineBadgeCheck
                    className={clsx(
                      "h-10 w-10 transition-colors",
                      isSelected(tier.id) ? "text-green-500" : "text-gray-300"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GradientCard>

      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="contained" color="primary" size="large" onClick={handleNext}>
            Suivant
          </Button>
        </motion.div>
      )}
    </div>
  );
}
