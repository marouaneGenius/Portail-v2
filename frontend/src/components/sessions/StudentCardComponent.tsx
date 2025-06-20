import React, { useEffect, useState } from 'react';
import api from '@/api/aixos';

type SessionData = {
  id: number;
  payment_date: string;
  date_slot: string;
  stripe_number?: string;
  school_subjects?: string[];
  resume?: string;
  scheduled_at?: string;
  scheduled_by?: string;
  session_type?: string;
  is_canceled: boolean;
  canceled_by?: number;
  is_paid?: boolean;
};

type Student = {
  id: number;
  firstname: string;
  lastname: string;
  gender?: string;
  class?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  school_subjects?: string[];
};

interface StudentCardProps {
  student: Student;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student }:any) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // console.log(student.sessions)

    if(student) {
        setSessions(student.sessions);
        setLoading(false)
    }
  }, [student.id]);

  return (
    <div className="bg-gray-200 rounded shadow p-4 w-full ">
      <h3 className="text-lg font-semibold">
        {student.firstname} {student.lastname}
      </h3>
      <p className="text-sm text-gray-600 mb-2">{student.email}</p>
      {loading ? (
        <p className="text-sm text-gray-500">Chargement des sessions...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="space-y-2">
          {sessions.length > 0 ? (
            sessions.map(s => (
              <div key={s.id} className={s.session_type === 'trial_session' ? "border rounded p-2 bg-yellow-100" : "border rounded p-2 bg-white"}>

                <div className="text-sm">
                  <span className="font-medium">Session #{s.id}</span> - {new Date(s.date_slot).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-xs text-gray-600">
                  Créneau: {new Date(s.payment_date).toLocaleDateString('fr-FR')} <br />
                  Type: {s.session_type ?? '—'} <br />
                  Payé: {s.is_paid ? 'Oui' : 'Non'}
                  {s.school_subjects && s.school_subjects.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.school_subjects.map(sub => (
                        <span
                          key={sub}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">Aucune session trouvée.</p>
          )}
        </div>
      )}
    </div>
  );
};
