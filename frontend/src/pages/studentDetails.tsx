import { Avatar, Button } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/aixos";
import { useParams } from "react-router-dom";
import { DetailPageParams } from "../components/ItemDetails";
import { ActionGrid } from "../components/CustomAlert";
import { getDate } from "../services/functions";
import { GradientCard } from "../components/GardientCard";
import { useAuth } from "@/Hooks/auth";
import { PaymentStatus } from "../components/TrialSessionCard";

interface StudentItem {
    id: string;
    email:String;
    firstname:String;
    lastname:String;
    class:String;
    created_at:string;
    center:{
        id:String;
        name:String;
    };
    sessions?:any;
}
  
  export const StudentDetails: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { id } = useParams<DetailPageParams>();
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState<StudentItem>();
    const [trialSessions, setTrialSessions] = useState<any>([]);
    const [allSessions, setAllSessions] = useState<any>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'catchup' | 'trial'>('upcoming');
    const [studentId, setId] = useState<any>(id);
    const [refreshKey, setRefreshKey] = useState(0);
    const { user }:any = useAuth();
    

    useEffect(() => {
        // if (!resource || !id) return;
        setLoading(true);
        api.get(`/api/student/${studentId}`)
          .then(({ data }:any) => {
            console.log(data)
            const trial_sessions = data.sessions?.filter((s: any) => s.session_type === 'trial_session') || [];
            const standard_sessions = data.sessions?.filter((s: any) => s.session_type !== 'trial_session') || [];
            setTrialSessions(trial_sessions)
            setAllSessions(standard_sessions)
            setStudent(data);
          })
          .catch((err:any) => {
            setError(err.response?.data?.message || 'Erreur de chargement');
          })
          .finally(() => setLoading(false));

    }, [id, refreshKey]);

    // Fonctions de filtrage des séances
    const getUpcomingSessions = () => {
        const now = new Date();
        return allSessions.filter((session: any) => {
            const sessionDate = new Date(session.scheduled_at);
            return sessionDate > now && !session.is_canceled && !session.is_suspended;
        }).sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    };

    const getPastSessions = () => {
        const now = new Date();
        return allSessions.filter((session: any) => {
            const sessionDate = new Date(session.scheduled_at);
            return sessionDate <= now && !session.is_suspended;
        }).sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    };

    const getCatchupSessions = () => {
        return allSessions.filter((session: any) => {
            return session.is_canceled && !session.is_suspended;
        }).sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    };

    const formatSessionDateTime = (scheduled_at: string) => {
        const date = new Date(scheduled_at);
        return {
            date: date.toLocaleDateString('fr-FR'),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const sessionAction = async(session:any) => {
        const values = {
            is_canceled : session.is_canceled ? false : true,
            canceled_by: user.id
        }
        try{
            api.patch(`/api/sessions/${session.id}/action`, values).then((res)=>{
                if(res) {
                    alert('Session modifiée avec succès')
                    setRefreshKey(prev => prev + 1);

                    // Mettre à jour les séances d'essai
                    setTrialSessions((prevSessions:any) =>
                        prevSessions.map((s:any) =>
                          s.id === session.id
                            ? { ...s, is_canceled: values.is_canceled }
                            : s
                        )
                    );

                    // Mettre à jour toutes les séances
                    setAllSessions((prevSessions:any) =>
                        prevSessions.map((s:any) =>
                          s.id === session.id
                            ? { ...s, is_canceled: values.is_canceled }
                            : s
                        )
                    );
                }
            })

        }catch(e:any) {
            console.error('Error =>>', e)
        }

    }
  
    return (

        <div className=" flex justify-center p-4">
            <GradientCard className=" w-2/5 " innerClassName="p-4 space-y-6">
                {
                    student ?        
                    <>
                        <div className="flex flex-col items-center space-y-4 ">
                            <div className="p-3 rounded-full gardient shadow-lg">
                                <Avatar
                                    src={"/images/avatar.svg"}
                                    sx={{ width: 150, height: 150 }}
                                    className="bg-gray-300"
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-center ">{student.firstname} {student.lastname}</h1>
                            <p className="text-gray-500 text-center ">{student.email}</p>
                            <div className="w-5/6 flex justify-between">
                                {student.center && (
                                <span className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm shadow-lg">
                                    {student.center.name}
                                </span>
                                )}
                                {student.class && (
                                <span className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm shadow-lg">
                                    {student.class}
                                </span>
                                )}

                                {student.created_at && (
                                    <small className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full shadow-lg">
                                        crée le: {getDate(student.created_at)}
                                    </small>
                                )}
                            </div>
                        </div>
                        {/* Section des séances avec onglets */}
                        <div className="bg-gray-100 p-4 rounded w-full">
                            <h4 className="font-medium text-gray-700 mb-4">Séances</h4>

                            {/* Navigation par onglets */}
                            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 text-sm ${
                                        activeTab === 'upcoming'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    À venir ({getUpcomingSessions().length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('past')}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 text-sm ${
                                        activeTab === 'past'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    Passées ({getPastSessions().length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('catchup')}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 text-sm ${
                                        activeTab === 'catchup'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    À rattraper ({getCatchupSessions().length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('trial')}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 text-sm ${
                                        activeTab === 'trial'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    Essais ({trialSessions.length})
                                </button>
                            </div>

                            {/* Contenu des onglets */}
                            <div className="space-y-3">
                                {activeTab === 'upcoming' && (
                                    getUpcomingSessions().length > 0 ? (
                                        getUpcomingSessions().map((session: any) => (
                                            <div key={session.id} className="bg-white p-3 rounded border shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{formatSessionDateTime(session.scheduled_at).date}</span>
                                                            <span className="text-blue-600">{formatSessionDateTime(session.scheduled_at).time}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {session.school_subjects && Array.isArray(session.school_subjects)
                                                                ? session.school_subjects.join(', ')
                                                                : session.school_subjects || 'Matière non spécifiée'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                                            Planifiée
                                                        </span>
                                                        <Button variant="outlined" color="error" size="small" onClick={() => sessionAction(session)}>
                                                            <span className="text-xs">Annuler</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Aucune séance à venir
                                        </div>
                                    )
                                )}

                                {activeTab === 'past' && (
                                    getPastSessions().length > 0 ? (
                                        getPastSessions().map((session: any) => (
                                            <div key={session.id} className="bg-white p-3 rounded border shadow-sm opacity-75">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{formatSessionDateTime(session.scheduled_at).date}</span>
                                                            <span className="text-gray-600">{formatSessionDateTime(session.scheduled_at).time}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {session.school_subjects && Array.isArray(session.school_subjects)
                                                                ? session.school_subjects.join(', ')
                                                                : session.school_subjects || 'Matière non spécifiée'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            session.is_canceled
                                                                ? 'bg-red-100 text-red-800'
                                                                : session.is_absent
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {session.is_canceled ? 'Annulée' : session.is_absent ? 'Absent' : 'Terminée'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Aucune séance passée
                                        </div>
                                    )
                                )}

                                {activeTab === 'catchup' && (
                                    getCatchupSessions().length > 0 ? (
                                        getCatchupSessions().map((session: any) => (
                                            <div key={session.id} className="bg-amber-50 p-3 rounded border border-amber-200 shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{formatSessionDateTime(session.scheduled_at).date}</span>
                                                            <span className="text-amber-600">{formatSessionDateTime(session.scheduled_at).time}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {session.school_subjects && Array.isArray(session.school_subjects)
                                                                ? session.school_subjects.join(', ')
                                                                : session.school_subjects || 'Matière non spécifiée'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                                            Annulée
                                                        </span>
                                                        <Button variant="outlined" color="info" size="small" onClick={() => sessionAction(session)}>
                                                            <span className="text-xs">Reprogrammer</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Aucune séance à rattraper
                                        </div>
                                    )
                                )}

                                {activeTab === 'trial' && (
                                    <PaymentStatus
                                        studentId={studentId}
                                        sessions={trialSessions}
                                        onSessionUpdate={() => setRefreshKey(prev => prev + 1)}
                                    />
                                )}
                            </div>
                        </div>
                        <ActionGrid studentId={student.id} />
                    </>  
                    : 
                    <div className="space-y-2 bg-re-500">
                        <h2 className="text-xl font-semibold">Chargement ...</h2>
                        <ul className="list-disc list-inside text-gray-700">
                        </ul>
                    </div>
                }
            </GradientCard>
        </div>

    );
  };