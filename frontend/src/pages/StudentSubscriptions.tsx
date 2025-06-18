import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Hooks/auth";
import api from "../api/aixos";
import { GradientCard } from "../components/GardientCard";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { RPConfig, RPDefaultLayout, RPPages, RPProvider } from "@pdf-viewer/react";

interface Contract {
  id: number;
  subscription_id: number;
  url: string;
}

export default function StudentSubscriptions() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [student, setStudent] = useState<any>();
  const [selected, setSelected] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 
  
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<any>(`/api/student/${id}`).then((res) => setStudent(res.data)).catch(() => {
      setError("Impossible de charger les informations de l'étudiant.");
    });

    api.get<Contract[]>(`/api/subscription-url/student/${id}`)
      .then(res => setContracts(res.data))
      .catch(() => setError("Impossible de charger les contrats."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    console.log("Student data loaded:", student, contracts);
  }, [student])

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <p>Chargement…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;

  return (
    <div className="px-4 py-8 space-y-8">
      <GradientCard className="w-full md:w-4/5 mx-auto" innerClassName="p-8">
      {student && 
        <h1 className="text-3xl font-bold mb-6 text-center">
          Les contrats de {student.firstname} {student.lastname}
        </h1>
        }

        {!selected && 
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {contracts.map((c:any) => (
            <div className=" ">
              <div
                key={c.id}
                className={c.is_valide ? 
                  `border  rounded overflow-hidden flex flex-col border-4 border-green-500` 
                  : `border rounded overflow-hidden flex flex-col border-4 border-orange-500 ` }
              >
                <div className="flex-1 bg-gray-100">
                  <iframe
                    src={c.url}
                    title={`Contrat ${c.id}`}
                    width="100%"
                    height="150px"
                    className="object-cover"
                  />
                </div>

                <div className="flex justify-between p-1">
                  <button
                    onClick={() => setSelected(c)}
                    className="px-2 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700 border-2 rounded"
                  >
                    Voir le pdf
                  </button>

                  <button
                    onClick={() => navigate(`/contract/${c.subscription_id}/${student.id}`)}
                    className="px-2 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700 border-2"
                  >
                    Voir le contrat 
                  </button>
                </div>

              </div>
              <p className={c.is_valide ? `text-center text-sm mt-3 text-green-400` : `text-center text-sm mt-3 text-orange-400` }>
                {c.is_valide ? `Contrat Validé` : `Contrat pas Validé` }
              </p>
            </div>

          ))}
        </div> }

        {
            contracts.length === 0 && (
              <p className="text-gray-600 text-center mt-4">
                Aucun contrat trouvé pour cet étudiant.
              </p>
            )
        }
        {/* 2) Visionneuse en grand */}


        {selected && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">
              Contrat #{selected.id} — abonnement {selected.subscription_id}
            </h2>
            <div className="w-full h-[600px] border">
              <iframe
                src={selected.url}
                title={`Aperçu grand contrat ${selected.id}`}
                width="100%"
                height="100%"
              />
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        )}
      </GradientCard>
    </div>
  );
}



// Seances

/**
 * refaire la bdd pour la partie subscription - session, c'est une many to one (une session est lie a un abonnement, un abonnement a plusieurs sessions)
 * un bouton qui va programer toutes les sreances du contrat annuel / pre
 * une seance sd on doit choisir/filtrer matiere, tuteuret date-heure
 * 
 * 
 */