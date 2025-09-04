// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import TrialSessionComponent from '@/components/sessions/TrialSessionComponent';
import api from '@/api/aixos';

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<any>();
  const [student, setStudent] = useState();

  useEffect(() => {
    api.get(`/api/student/${id}`).then((res) => setStudent(res.data))
  }, [id])

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className=" mx-auto py-0 px-4">
      <h1 className="text-3xl font-bold mb-2">Sessions d'essai</h1>

        <TrialSessionComponent student={student} />
    </div>
  );
};

export default Sessions;