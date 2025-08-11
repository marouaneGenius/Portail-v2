import React from 'react';
import { actions } from '../mocks/mocks';
import { CustomButton } from './CustomButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building, MapPin, Phone, Users, User, Mail, Calendar } from 'lucide-react';
import api from '@/api/aixos';

interface CustomAlertProps {
  title?: string;
  message?: string;
  action?: (item: any) => void;
}

interface CustomComponentProps {
  value?: any;
  currentkey?: any;
  onRedirect?: (item: any) => void;
  action?: (item: any) => void;
  id?: string;
  studentId?: number; // Ajouter l'ID de l'étudiant pour récupérer les frères/sœurs
}

export interface BrothersComponentProps {
  brothers: {
    id: number;
    firstname: string;
    lastname: string;
    [key: string]: any;
  }[];
}

export interface Action {
  label: string;
  to: (studentId: number) => string;
}

// Alert stylée en card
export const CustomAlert: React.FC<CustomAlertProps> = ({ title, message, action }) => (
  <div className="flex justify-center py-4">
    <div
      className="w-full max-w-md bg-white border border-hello-yellow rounded-xl shadow-md p-4 flex flex-col items-center gap-2"
      role="alert"
      onClick={action}
    >
      {title && (
        <span className="inline-block rounded-full bg-hello-yellow/90 uppercase px-3 py-1 text-xs font-bold text-white mb-1">
          {title}
        </span>
      )}
      <span className="font-semibold text-mister-anthracite text-center">{message}</span>
    </div>
  </div>
);

// Table → Card pour les parents
export function CustomParentComponent({
  value,
  currentkey,
  onRedirect,
  action,
  studentId,
}: CustomComponentProps): React.ReactNode {
  const [siblings, setSiblings] = React.useState<any[]>([]);
  const [loadingSiblings, setLoadingSiblings] = React.useState(false);
  console.log(value)
  if (currentkey !== 'parents' || !Array.isArray(value)) return null;

  // Si aucun parent
  if (value.length === 0) {
    return (
      <CustomAlert
        title="Attention !"
        message="L'élève n'a pas de parent !"
        action={action}
      />
    );
  }

  // Récupérer les frères et sœurs si on a l'ID de l'étudiant
  React.useEffect(() => {
    const fetchSiblings = async () => {
      if (!studentId) return;
      
      setLoadingSiblings(true);
      try {
        const response = await api.get(`/api/student/${studentId}/siblings`);
        setSiblings(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des frères/sœurs:', error);
        setSiblings([]);
      } finally {
        setLoadingSiblings(false);
      }
    };

    fetchSiblings();
  }, [studentId]);

  // On suppose ici que le premier parent est le parent responsable
  const parent = value[0];

  return (
    <Card className="border-fading-grey">
      <CardHeader>
        <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
          <Users className="w-5 h-5 text-crazy-magenta" />
          Famille
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parent */}
        <div>
          <h4 className="font-medium text-mister-anthracite mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Parent responsable
          </h4>
          <div className="bg-fading-grey/30 p-4 rounded-lg space-y-2">
            <div className="font-medium text-mister-anthracite">{parent.firstname} {parent.lastname}</div>
            {parent.profession && (
              <div className="text-sm text-mister-anthracite/70">{parent.profession}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              {parent.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-mister-anthracite/60" />
                  <span className="text-mister-anthracite/70">{parent.email}</span>
                </div>
              )}
              {parent.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-mister-anthracite/60" />
                  <span className="text-mister-anthracite/70">{parent.phone}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRedirect?.(`parent/${parent.id}`)}
                className="py-2 px-4 text-xs font-semibold text-mister-anthracite bg-white rounded-lg border border-hello-yellow hover:bg-hello-yellow/10 hover:text-hello-yellow focus:outline-none focus:ring-4 focus:ring-hello-yellow/20 transition"
              >
                Voir
              </button>
            </div>
          </div>
        </div>

        {/* Frères et sœurs */}
        <div>
          <h4 className="font-medium text-mister-anthracite mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Frères et sœurs
            {loadingSiblings && (
              <span className="text-xs text-mister-anthracite/60 ml-1">(chargement...)</span>
            )}
            {siblings.length > 0 && !loadingSiblings && (
              <span className="text-xs text-mister-anthracite/60 ml-1">({siblings.length})</span>
            )}
          </h4>
          
          {loadingSiblings ? (
            <div className="text-sm text-mister-anthracite/60 italic">
              Chargement des frères et sœurs...
            </div>
          ) : siblings.length > 0 ? (
            <div className="space-y-2">
              {siblings.map((sibling: any) => (
                <div key={sibling.id} className="bg-fading-grey/30 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-mister-anthracite font-medium">
                      {sibling.firstname} {sibling.lastname}
                    </div>
                    {sibling.class && (
                      <div className="text-xs text-mister-anthracite/60">
                        Classe: {sibling.class}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRedirect?.(`student/${sibling.id}`)}
                    className="text-xs text-hello-yellow hover:underline"
                  >
                    Voir
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mister-anthracite/70 italic">Aucun frère ou sœur enregistré</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Table → Card pour les étudiants
export function CustomStudentsComponent({
  value,
  currentkey,
  onRedirect,
}: CustomComponentProps): React.ReactNode {
  if (currentkey !== 'students' || !Array.isArray(value)) return null;

  if (value.length === 0) {
    return (
      <CustomAlert
        title="Attention !"
        message="Aucun enfant enregistré pour ce parent."
      />
    );
  }

  return (
    <Card className="border-fading-grey">
      <CardHeader>
        <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
          <Users className="w-5 h-5 text-crazy-magenta" />
          Enfants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {value.map((student: Record<string, any>) => (
          <div key={student.id} className="bg-fading-grey/30 p-4 rounded-lg space-y-2">
            <div className="font-medium text-mister-anthracite flex items-center gap-2">
              <User className="w-4 h-4" />
              {student.firstname} {student.lastname}
              {student.class && (
                <span className="ml-2 text-xs text-mister-anthracite/60 bg-white border border-fading-grey rounded px-2 py-0.5">
                  {student.class}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              {student.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-mister-anthracite/60" />
                  <span className="text-mister-anthracite/70">{student.email}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-mister-anthracite/60" />
                  <span className="text-mister-anthracite/70">{student.phone}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRedirect?.(`student/${student.id}`)}
                className="py-2 px-4 text-xs font-semibold text-mister-anthracite bg-white rounded-lg border border-hello-yellow hover:bg-hello-yellow/10 hover:text-hello-yellow focus:outline-none focus:ring-4 focus:ring-hello-yellow/20 transition"
              >
                Voir
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export const CustomReportsComponent: React.FC<CustomComponentProps> = ({ value, currentkey }) => {
  return (
    <>
      {currentkey === 'reports' && Array.isArray(value) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {value.map((report: Record<string, any>, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-fading-grey rounded-xl shadow p-4 flex flex-col gap-2"
            >
              {Object.entries(report).map(([k, v]) => (
                <div key={k}>
                  <span className="font-medium capitalize">{k.replace('_', ' ')}:</span>{' '}
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {currentkey === 'reports' && value.length === 0 && (
        <CustomAlert title="Message !" message="Vous n'avez pas de Comptes rendu pour l'instant" />
      )}
    </>
  );
};

export const CustomTutorScheduleComponent: React.FC<CustomComponentProps> = ({
  value,
  currentkey,
  onRedirect,
  id,
  action,
}) => {
  return (
    <>
      {currentkey === 'tutor_schedules' && Array.isArray(value) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {value.map((row: Record<string, any>, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-fading-grey rounded-xl shadow p-4 flex flex-col gap-2"
            >
              {Object.entries(row).map(([key, cell]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>{' '}
                  <span>
                    {key === 'centers' && Array.isArray(cell)
                      ? cell.map((center: any) => center.name).join(', ')
                      : String(cell)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {currentkey === 'tutor_schedules' && value.length !== 0 && (
        <div className="flex gap-2 mt-2">
          <CustomButton action={() => action?.('planing')} title="Voir le planning" />
          <CustomButton action={onRedirect} title="Gérer le planning" />
        </div>
      )}

      {currentkey === 'tutor_schedules' && value.length === 0 && (
        <CustomAlert
          title="Attention !"
          message="Vous n'avez pas de créneau pour l'instant, cliquez ici pour créer des créneaux !"
          action={onRedirect}
        />
      )}
    </>
  );
};


export const CustomSessionComponent = ({ value, currentkey, student }:any) => {
  // Helper pour formatter la date
  const formatDate = (dateStr:any) => {
    const date = new Date(dateStr);
    // ex: lundi 15 janvier
    return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  };
  const formatTime = (dateStr:any) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  let sessions: any = Array.isArray(value) ? value : [];

  sessions = sessions
    .filter((s: any) => !!s.scheduled_at)
    .sort((a: any, b: any) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  
  // Trouve la prochaine séance (future)
  const now = new Date();
  const nextSession = sessions.find((s:any) => new Date(s.scheduled_at) >= now);
  
  // Trouve la dernière séance passée
  const lastSession: any = [...sessions]
    .filter(s => new Date(s.scheduled_at) < now)
    .sort((a: any, b: any) =>
      new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    )[0];

  // (option) Affichage du prénom de l'enfant si parent
  const getStudentName = (session:any) =>
    session.student_firstname && session.student_lastname
      ? `${session.student_firstname} ${session.student_lastname}`
      : null;

  return (
    <div className="p-2">
      <div className="space-y-4">

        {/* Prochaine séance */}
        {nextSession && (
          <div>
            <div className="text-gray-600 text-sm mb-1">Prochaine séance</div>
            <div className="bg-blue-50 rounded-lg px-4 py-3 mb-2">
              <div className="font-semibold text-base text-blue-900">
                {formatDate(nextSession.scheduled_at)}
                {getStudentName(nextSession) && (
                  <span className="ml-2 text-blue-500 text-xs">
                    ({getStudentName(nextSession)})
                  </span>
                )}
              </div>
              <div className="text-blue-900 text-md mt-1">{formatTime(nextSession.scheduled_at)}</div>
            </div>
          </div>
        )}

        {/* Dernière séance */}
        {lastSession && (
          <div>
            <div className="text-gray-600 text-sm mb-1">Dernière séance</div>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="font-semibold text-base text-gray-800">
                {formatDate(lastSession.scheduled_at)}
                {getStudentName(lastSession) && (
                  <span className="ml-2 text-blue-500 text-xs">
                    ({getStudentName(lastSession)})
                  </span>
                )}
              </div>
              <div className="text-gray-800 text-md mt-1">{formatTime(lastSession.scheduled_at)}</div>
            </div>
          </div>
        )}

        {/* Aucun */}
        {!nextSession && !lastSession && (
          <div className="text-gray-400 italic text-center">
            Aucune séance planifiée ou passée.
          </div>
        )}
      </div>
    </div>
  );
};

export const CustomCenterComponent: React.FC<CustomComponentProps> = ({
  value,
  currentkey,
  onRedirect,
}) => {
  const centers = Array.isArray(value) ? value : value ? [value] : [];

  if (currentkey !== 'centers') {
    return null;
  }

  if (centers.length === 0) {
    return (
      <CustomAlert
        title="Message !"
        message="Vous n'avez pas de centre pour l'instant"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {centers.map((ctr: any) => (
        <Card key={ctr.id} className="border-fading-grey">
          <CardHeader>
            <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
              <Building className="w-5 h-5 text-hello-yellow" />
              {ctr.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* <div>
              <h4 className="font-medium text-mister-anthracite">{ctr.name}</h4>
            </div> */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-mister-anthracite/60 mt-0.5" />
              <span className="text-mister-anthracite/70">{ctr.address}, {ctr.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-mister-anthracite/60" />
              <span className="text-mister-anthracite/70">{ctr.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-mister-anthracite/60" />
              <span className="text-mister-anthracite/70">{ctr.email}</span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRedirect?.(`center/${ctr.id}`)}
                className="py-2 px-4 text-xs font-semibold text-mister-anthracite bg-white rounded-lg border border-hello-yellow hover:bg-hello-yellow/10 hover:text-hello-yellow focus:outline-none focus:ring-4 focus:ring-hello-yellow/20 transition"
              >
                Voir
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const CustomBrothersComponent: React.FC<BrothersComponentProps> = ({
  brothers,
}) => (
  <div className="mt-2">
    <h1 className="bg-border border-b-2 color-border p-4 mt-0 text-lg text-mister-anthracite rounded-t-xl">
      Frères et soeurs
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {brothers.map((bro) => (
        <div
          key={bro.id}
          className="flex items-center justify-between p-4 bg-fading-grey rounded-xl shadow"
        >
          <span className="font-medium text-mister-anthracite">
            {bro.firstname} {bro.lastname}
          </span>
          <button
            type="button"
            className="py-2 px-4 text-xs font-semibold text-mister-anthracite bg-white rounded-lg border border-hello-yellow hover:bg-hello-yellow/10 hover:text-hello-yellow focus:outline-none focus:ring-4 focus:ring-hello-yellow/20 transition"
          >
            Voir
          </button>
        </div>
      ))}
      {brothers.length === 0 && (
        <CustomAlert title="Message!" message="l'élève n'a pas de Frères et soeurs" />
      )}
    </div>
  </div>
);

export const ActionGrid: React.FC<{ studentId: any }> = ({ studentId }) => (
  <div className="p-2 bg-fading-grey grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl">
    {actions.map((a) => (
      <a
        key={a.label}
        href={a.to(studentId)}
        className="bg-white text-center hover:bg-hello-yellow/10 text-hello-yellow font-semibold py-2 px-4 border color-border rounded shadow transition"
      >
        {a.label}
      </a>
    ))}
  </div>
);
