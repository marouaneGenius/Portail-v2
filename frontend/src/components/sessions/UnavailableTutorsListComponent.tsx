import { ClockIcon, XCircleIcon } from "lucide-react";

interface Tutor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  school_subjects: string[];
  events: {
    day: string;
    start_hour: string;
    end_hour: string;
  }[];
}

export const UnavailableTutorsListComponent = ({ tutors, student }: any) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
      <div className="flex items-start gap-2 mb-3">
        <div>
          <p className="text-sm text-amber-700">
            {tutors.length} Tuteurs disponibles dans a {student && student.centers && student.centers.name} 
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {tutors.map((tutor:any) => (
          <div key={tutor.id} className="bg-white p-3 rounded border border-amber-100">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">
                {tutor.firstname} {tutor.lastname}
              </h4>
              <span className="text-xs text-amber-600">{tutor.email}</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {tutor.school_subjects.map((subject:any) => (
                <span 
                  key={subject} 
                  className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800"
                >
                  {subject}
                </span>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
              <ClockIcon className="h-3 w-3" />
              <span>Dispo :</span>
              {tutor.events.slice(0, 2).map((event:any, i:any) => (
                <span key={i} className="capitalize">
                  {event.day} {formatTime(event.start_hour)}-{formatTime(event.end_hour)}
                  {i < tutor.events.length - 1 && i < 1 ? ', ' : ''}
                </span>
              ))}
              {tutor.events.length > 2 && (
                <span className="text-amber-600">+{tutor.events.length - 2}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};