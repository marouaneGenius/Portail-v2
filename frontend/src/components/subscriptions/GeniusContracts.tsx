import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Card } from "@mui/material";
import api from "../../api/aixos";
import ContractPdfExporter from "./views/PdfGenerator";
import GeniusContractForm from "./GeniusContractForm";


const GeniusContracts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Charger les informations de l'étudiant
      api.get(`/api/student/${id}`)
        .then(({ data }) => {
          setStudent(data);
        })
        .catch((error) => {
          console.error('Erreur lors du chargement de l\'étudiant:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return <GeniusContractForm student={null} />;
  }

  return <GeniusContractForm student={student} />;
};

export default GeniusContracts;
