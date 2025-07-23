import React, { useEffect, useState } from "react";
import api from "@/api/aixos";
import { StudentSubscriptionCard } from "./StudentSubscriptionCard";

// Props : { resource, item, id }
export function StudentsSubscriptions({ resource, item, id }:any) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Si le resource est un parent, on charge les étudiants détaillés (API)
  useEffect(() => {
    if (resource === "parent" && item?.students?.length > 0) {
      setLoading(true);
      Promise.all(
        item.students.map((student: any) =>
          api.get(`/api/student/${student.id}`).then((res) => res.data)
        )
      )
        .then(setStudents)
        .finally(() => setLoading(false));
    }
  }, [resource, item]);

  // Cas parent : affiche les cartes de tous ses enfants
  if (resource === "parent") {
    if (loading) return <div>Chargement...</div>;
    if (!students.length) return null;
    return (
      <div className="flex flex-col gap-8">
        {students.map((student: any) => (
          <div key={student.id} className="mb-6 bg-gray-100 rounded p-2">
            <div className="font-bold text-base mb-2">
              {student.firstname} {student.lastname}
            </div>
            <StudentSubscriptionCard studentId={student.id} student={student} />
          </div>
        ))}
      </div>
    );
  }

  // Cas étudiant : affiche une seule carte
  if (resource === "student") {
    return (
      <StudentSubscriptionCard studentId={id} student={item} />
    );
  }

  // Par défaut : rien à afficher
  return null;
}
