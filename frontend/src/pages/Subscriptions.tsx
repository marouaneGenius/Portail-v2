import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Hooks/auth";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { tiers } from "../mocks/mocks";
import { GradientCard } from "../components/GardientCard";

type TierId = typeof tiers[number]["id"];

export default function Subscriptions() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<TierId[]>([]);
  const navigate = useNavigate();
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const { id } = useParams<{ id: string }>();

  const toggle = (id: TierId) => {
    setSelected((s) => (s.includes(id) ? s.filter((t) => t !== id) : [...s, id]));
  };
  const isSelected = (id: TierId) => selected.includes(id);

  const handleNext = () => {
    const paramsString = new URLSearchParams(params).toString();
    navigate(`/subscriptions/${id}?${paramsString}`);
  };

  useEffect(() => {
    const newParams: { [key: string]: string } = {};
    selected.forEach((tierId) => {
      const tier = tiers.find((t) => t.id === tierId);
      if (tier) {
        newParams[tierId] = tier.id;
      }
    });
    setParams(newParams);
  }, [selected]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col items-center py-8 px-2 sm:px-6 space-y-10 bg-gradient-to-br from-hello-yellow/10 via-white to-crazy-magenta/10 min-h-screen">
      <GradientCard className="w-full max-w-5xl" innerClassName="p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-mister-anthracite">
          Choisissez votre abonnement
        </h1>
        <p className="text-center text-mister-anthracite/70 mb-8 max-w-2xl mx-auto">
          Sélectionnez l’abonnement qui correspond le mieux à vos besoins. Vous pouvez en choisir plusieurs.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              onClick={() => toggle(tier.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "select-none transition-all duration-200",
                isSelected(tier.id) && "scale-105"
              )}
            >
              <div className={clsx(
                "rounded-2xl overflow-hidden shadow-lg border-2 transition-all group cursor-pointer relative",
                isSelected(tier.id)
                  ? "border-hello-yellow ring-2 ring-hello-yellow/40 bg-white"
                  : "border-fading-grey bg-white/80 hover:border-hello-yellow/60"
              )}>
                <div className="relative h-64 w-full">
                  <img
                    src={tier.img}
                    alt={tier.title}
                    className="absolute inset-0 h-full w-full object-cover scale-110 transition-transform duration-500 group-hover:scale-100"
                  />
                  <div
                    className={clsx(
                      "absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-screen pointer-events-none",
                      tier.gradient
                    )}
                  />
                  {isSelected(tier.id) && (
                    <div className="absolute top-3 right-3 z-10 bg-hello-yellow rounded-full p-2 shadow-lg">
                      <HiOutlineBadgeCheck className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6 text-center flex flex-col items-center">
                  <h2 className="text-2xl font-semibold text-mister-anthracite mb-2">{tier.title}</h2>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GradientCard>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center"
        >
          <button
            className="bg-hello-yellow hover:bg-crazy-magenta text-mister-anthracite hover:text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all text-lg"
            onClick={handleNext}
          >
            Suivant
          </button>
        </motion.div>
      )}
    </div>
  );
}
