import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Hooks/auth";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
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
    // Set initial params based on selected tiers
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
    <div className=" flex flex-col items-center py-4 px-4 space-y-8">
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
