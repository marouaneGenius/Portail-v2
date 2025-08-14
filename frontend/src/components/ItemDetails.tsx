import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { JSX, useEffect, useState } from 'react';
import api from '../api/aixos';
import { useModal } from '../Hooks/useModal';
import Modal from './Modal';
import ParentSelector from './ParentFinder';
import { showDataDetails, TranslateHeaderNames } from '../services/functions';
import {
  CustomAlert,
  CustomBrothersComponent,
  CustomCenterComponent,
  CustomParentComponent,
  CustomReportsComponent,
  CustomSessionComponent,
  CustomStudentsComponent,
  CustomTutorScheduleComponent,
} from './CustomAlert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StudentsSubscriptions } from './subscriptions/StudentsSubscriptions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Shield, MapPin, Calendar, VenusAndMars, FileText, Building, CalendarCheck, CreditCard, CalendarDays, Zap, ShieldCheck, UserRound, GraduationCap } from 'lucide-react';
import { actions } from '../mocks/mocks'; // Assure-toi que le chemin est correct
import { getLevelOfClass } from './subscriptions/SubscriptionFunctions';
import { PaymentStatus } from './TrialSessionCard';

export interface DetailPageParams {
  resource: string;
  id: string;
  [key: string]: string | undefined;
}

const getRoleColor = (role: string) => {
  if (!role) return 'bg-fading-grey text-mister-anthracite border-fading-grey';
  if (role.includes('ADMIN')) return 'bg-crazy-magenta/10 text-crazy-magenta border-crazy-magenta/20';
  if (role.includes('USER')) return 'bg-hello-yellow/10 text-orange-600 border-orange-200';
  if (role.includes('TUTOR')) return 'bg-blue-100 text-blue-600 border-blue-200';
  return 'bg-fading-grey text-mister-anthracite border-fading-grey';
};
const getStatusColor = (status: string) =>
  status === 'Actif'
    ? 'bg-green-100 text-green-600 border-green-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

const initials = (item: any) =>
  [item.firstname, item.lastname].filter(Boolean).map((n: string) => n[0]).join('').toUpperCase();

const ItemDetails: React.FC = () => {
  const { resource, id } = useParams<DetailPageParams>();
  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateItem, setUpdateItem] = useState(false);
  const [brothers, setBrothers] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, open, close } = useModal();
  const [students, setStudents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!resource || !id) return;
    setLoading(true);
    api
      .get(`/api/${resource}/${id}`)
      .then(({ data }: any) => {
        setItem(data);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Erreur de chargement');
      })
      .finally(() => setLoading(false));

    if (resource === 'student') {
      getBrothers();
    }
  }, [resource, id, updateItem, refreshKey]);

  const updateCurrentItem = (student: any) => {
    setUpdateItem(student);
  };

  const redirection = (route: any) => {
    navigate(`/${route}`);
  };

  const redirectionToForm = () => {
    navigate(`/form/tutorschedule/${id}`);
  };

  const getBrothers = () => {
    api.get(`/api/student/${id}/siblings`).then(({ data }: any) => setBrothers(data));
  };



  // Ajoute cette fonction pour la suppression
  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet élément ?')) return;
    try {
      await api.delete(`/api/${resource}/${id}`);
      navigate(`/${resource}s`);
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Ajoute cette fonction pour la modification
  const handleEdit = () => {
    navigate(`/${resource}/${id}/edit`);
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!item) return <Navigate to={`/${resource}`} replace />;

  const mainFields = ['firstname', 'lastname', 'email', 'phone', 'gender'];
  const addressFields = ['address', 'city', 'zip_code', 'country'];
  const otherFields = Object.keys(item).filter(
    (key) =>
      !mainFields.includes(key) &&
      !addressFields.includes(key) &&
      !['parents', 'students', 'reports', 'sessions', 'centers', 'tutorschedules', 'school_subjects', 'is_active'].includes(key)
  );

  // Pour le badge statut
  const statusLabel = item.is_active ? 'Actif' : 'Inactif';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-mister-anthracite">
              {item.firstname} {item.lastname}
            </h1>
            <p className="text-mister-anthracite/70 capitalize">Détails du {resource}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Informations principales */}
          <Card className="border-fading-grey">
            <CardHeader>
              <CardTitle className="text-xl text-mister-anthracite flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-hello-yellow to-crazy-magenta rounded-full flex items-center justify-center">
                  <span className="text-dat-white text-lg font-semibold">
                    {initials(item)}
                  </span>
                </div>
                {item.firstname} {item.lastname}
              </CardTitle>
              {/* <CardDescription>
                Informations détaillées de {item.firstname}
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mainFields.map((key) =>
                  item[key] !== undefined && key !== 'firstname' && key !== 'lastname' ? (
                    <div key={key} className="flex items-center gap-3">
                      {key === 'email' && <Mail className="w-5 h-5 text-mister-anthracite/50" />}
                      {key === 'phone' && <Phone className="w-5 h-5 text-mister-anthracite/50" />}
                      {key === 'gender' && <VenusAndMars className="w-5 h-5 text-mister-anthracite/50" />}
                      <div>
                        <p className="text-sm text-mister-anthracite/70">{TranslateHeaderNames(key)}</p>
                        <p className="font-medium text-mister-anthracite">
                          {showDataDetails(item[key], key)}
                        </p>
                      </div>
                    </div>
                  ) : null
                )}
                {/* Ajout matières du tuteur */}
                {item.school_subjects && Array.isArray(item.school_subjects) && item.school_subjects.length > 0 && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-mister-anthracite/50" />
                    <div>
                      <p className="text-sm text-mister-anthracite/70">Matières enseignées</p>
                      <p className="font-medium text-mister-anthracite">
                        {item.school_subjects.map((sub: any, i: number) => {
                          // Cherche le niveau correspondant dans item.class
                          const levelObj = Array.isArray(item.class)
                            ? item.class.find((cl: any) => cl.subject === (sub.value || sub.label || sub))
                            : null;
                          const label = sub.label || sub.value || sub;
                          return (
                            <span key={label} className="inline-block mr-2">
                              {label}
                              {levelObj && (
                                <span className="ml-1 text-xs text-mister-anthracite/60">
                                  (Jusqu'en {getLevelOfClass(levelObj.level)})
                                </span>
                              )}
                              {i < item.school_subjects.length - 1 && ','}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* <Separator /> */}
              {/* Adresse */}
              {addressFields.some((key) => item[key]) && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-mister-anthracite/50" />
                  <div>
                    <p className="text-sm text-mister-anthracite/70">Adresse</p>
                    <p className="font-medium text-mister-anthracite">
                      {[item.address, item.city, item.zip_code, item.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {/* Autres infos */}
              {otherFields.length > 0 && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherFields.map((key) =>
                      item[key] !== null && typeof item[key] !== 'object' ? (
                        <div key={key}>
                          <p className="text-sm text-mister-anthracite/70">{TranslateHeaderNames(key)}</p>
                          <p className="font-medium text-mister-anthracite">{showDataDetails(item[key], key)}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>



          <StudentsSubscriptions resource={resource} item={item} id={id} />


          {/* Cards pour les entités liées */}
          {Object.entries(item).map(([key, value]) => {
            if (key === 'parents')
              return (
                <Card key={key} className="border-fading-grey">
                  <CustomParentComponent 
                    currentkey={key} 
                    value={value} 
                    onRedirect={redirection} 
                    action={open} 
                    studentId={resource === 'student' ? parseInt(id!) : undefined}
                  />
                </Card>
              );
            if (key === 'students')
              return (
                <Card key={key} className="border-fading-grey">
                  <CustomStudentsComponent currentkey={key} value={value} onRedirect={redirection} />
                </Card>
              );
            if (key === 'reports')
              return (
                <Card key={key} className="border-fading-grey">
                  <CardHeader>
                    <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
                      <FileText className="w-5 h-5 text-crazy-magenta" />
                      Rapports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomReportsComponent currentkey={key} value={value} />
                  </CardContent>
                </Card>
              );
            if (key === 'tutorschedules')
              return (
                <Card key={key} className="border-fading-grey">
                  <CardHeader>
                    <CardTitle className="text-lg text-mister-anthracite">Plannings tuteur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomTutorScheduleComponent
                      currentkey={key}
                      value={value}
                      onRedirect={redirectionToForm}
                      action={redirection}
                      id={id}
                    />
                  </CardContent>
                </Card>
              );

            if (key === 'centers')
              return (
                <Card key={key} className="border-fading-grey">
                  <CardHeader>
                    <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
                      <Building className="w-5 h-5 text-hello-yellow" />
                      Centre d'affectation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomCenterComponent currentkey={key} value={value} onRedirect={redirection} />
                  </CardContent>
                </Card>
              );
            return null;
          })}
        </div>

        {/* Sidebar infos rapides */}
        <div className="space-y-6">
          <Card className="border-fading-grey">
            <CardHeader>
              <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-mister-anthracite/70">Statut du compte</p>
                  <Badge className={getStatusColor(statusLabel)}>{statusLabel}</Badge>
                  {/* Affiche le rôle si la ressource est "user" */}
                  {resource === "user" && item.roles && (
                    <div className="flex items-center gap-2 mt-2">
                      {/* Badge rôle dans le style DataTable */}
                      {(() => {
                        const role = item.roles[0];
                        const roleMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
                          ROLE_ADMIN: {
                            label: 'Admin',
                            color: 'bg-crazy-magenta/10 text-crazy-magenta',
                            icon: <ShieldCheck className="w-3 h-3 mr-1" />,
                          },
                          ROLE_USER: {
                            label: 'Utilisateur',
                            color: 'bg-fading-grey text-mister-anthracite',
                            icon: <UserRound className="w-3 h-3 mr-1" />,
                          },
                          ROLE_TUTOR: {
                            label: 'Tuteur',
                            color: 'bg-blue-100 text-blue-600',
                            icon: <GraduationCap className="w-3 h-3 mr-1" />,
                          },
                        };
                        const roleStyle = roleMap[role] || roleMap.ROLE_USER;
                        return (
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-mister-anthracite/70">Rôle</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleStyle.color}`}>
                                {roleStyle.icon} {roleStyle.label}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Séances */}
          {item.sessions && (
            <Card className="border-fading-grey">
              <CardHeader>
                <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-hello-yellow" />
                  Séances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomSessionComponent currentkey="sessions" value={item.sessions} />
              </CardContent>
            </Card>
          )}

          {/* Séances d'essai - Seulement pour les étudiants */}
          {resource === "student" && item.sessions && (
            <PaymentStatus 
              studentId={item.id}
              sessions={item.sessions}
              onSessionUpdate={() => setRefreshKey(prev => prev + 1)}
            />
          )}

          {/* Actions rapides */}
          {resource === "student" && (
            <Card className="border-fading-grey">
              <CardHeader>
                <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
                  <Zap className="w-5 h-5 text-crazy-magenta" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <TooltipProvider>
                    {/* Exemple générique pour tous les boutons */}
                    {[
                      { icon: <FileText className="w-6 h-6 text-orange-600" />, label: "Abonnement", href: actions[1].to(item.id), tooltip: "Ajouter un abonnement", hover: "hover:bg-orange-50" },
                      { icon: <Calendar className="w-6 h-6 text-blue-500" />, label: "Séance d'essai", href: actions[2].to(item.id), tooltip: "Créer une séance d'essai", hover: "hover:bg-hello-yellow/10" },
                      { icon: <CreditCard className="w-6 h-6 text-crazy-magenta" />, label: "Ajouter facture", href: actions[4].to(item.id), tooltip: "Créer une facture", hover: "hover:bg-crazy-magenta/10" },
                      { icon: <CalendarDays className="w-6 h-6 text-green-600" />, label: "Re-planifier", href: actions[6].to(item.id), tooltip: "Re-planifier les séances", hover: "hover:bg-green-50" },
                    ].map(({ icon, label, href, tooltip, hover }, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            variant="outline"
                            className={`w-full min-h-[90px] p-4 flex flex-col items-center justify-center gap-2 border-fading-grey text-center ${hover} overflow-hidden`}
                          >
                            <a
                              href={href}
                              className="w-full flex flex-col items-center justify-center text-wrap break-words text-sm max-w-full"
                            >
                              {icon}
                              <span className="leading-tight text-sm">{label}</span>
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>

          )}

          {/* Activité récente (exemple) */}
          {item.last_login && (
            <Card className="border-fading-grey">
              <CardHeader>
                <CardTitle className="text-lg text-mister-anthracite">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-mister-anthracite/50" />
                  <div>
                    <p className="text-sm text-mister-anthracite/70">Dernière connexion</p>
                    <p className="font-medium text-mister-anthracite">{item.last_login}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Créneaux de disponibilité */}
          {item.roles?.[0] === 'ROLE_TUTOR' && (
            <Card className="border-fading-grey">
              <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-500" />
                  Créneaux de disponibilité
                </CardTitle>
                <Button
                  onClick={() => navigate(`/form/tutorschedule/${id}`)}
                  className="bg-red-300"
                  size="sm"
                >
                  Ajouter des créneaux +
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {item.tutor_schedules && Array.isArray(item.tutor_schedules) && item.tutor_schedules.length > 0 ? (
                    item.tutor_schedules.map((slot: any, i: number) => (
                      <div key={slot.id || i} className="flex items-center gap-2 text-mister-anthracite">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Calendar className="w-4 h-4 text-hello-yellow" />
                          {slot.day}
                        </span>
                        <span className="text-sm text-mister-anthracite/70">
                          {slot.start_hour?.slice(0,5)} - {slot.end_hour?.slice(0,5)}
                        </span>
                        {slot.centers && Array.isArray(slot.centers) && slot.centers.length > 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {slot.centers.map((c: any) => c.name).join(', ')}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-mister-anthracite/50 italic">Aucun créneau renseigné pour ce tuteur.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal parent */}
      {/* <Modal
        isOpen={isOpen}
        title="Attacher ou créer le parent"
        onClose={close}
        footer={<Button variant="outline" onClick={close}>Fermer</Button>}
      >
        <ParentSelector student={item} onClose={close} updateItem={updateCurrentItem} />
      </Modal> */}
    </div >
  );
};

export default ItemDetails;
