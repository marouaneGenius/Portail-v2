import React from "react";

interface StudentInfoCardProps {
  student?: {
    firstname: string;
    lastname: string;
    class: string;
    centers?: { name: string };
  };
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student }) => {
  if (!student) return null;

  return (
    <div className="max-w-full mx-auto mt-2 mb-2">
      <div className="rounded-2xl shadow bg-gray-50 border border-gray-200 px-4 py-2 flex flex-col gap-1">
        <span className="text-[10px] text-gray-500 tracking-widest mb-1">POUR :</span>
        <div className="space-y-0.5 text-xs text-gray-700">
          <div className="font-medium">
            {student.firstname} {student.lastname}
          </div>
          <div className="text-[10px] text-gray-400">
            Classe&nbsp;: <span className="font-semibold text-gray-700">{student.class}</span>
          </div>
          <div className="text-[10px] text-gray-400">
            Centre&nbsp;: <span className="font-semibold text-gray-700">{student.centers?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
