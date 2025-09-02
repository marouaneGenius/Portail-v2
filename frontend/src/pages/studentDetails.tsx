import { Avatar, Button } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/aixos";
import { useParams } from "react-router-dom";
import { DetailPageParams } from "../components/ItemDetails";
import { ActionGrid } from "../components/CustomAlert";
import { getDate } from "../services/functions";
import { GradientCard } from "../components/GardientCard";
import { useAuth } from "@/Hooks/auth";

interface StudentItem {
    id: string;
    email:String;
    firstname:String;
    lastname:String;
    class:String;
    bio:String;
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
            setTrialSessions(trial_sessions)
            setStudent(data);
          })
          .catch((err:any) => {
            setError(err.response?.data?.message || 'Erreur de chargement');
          })
          .finally(() => setLoading(false));

    }, [id, refreshKey]);

    const sessionAction = async(session:any) => {
        const values = {
            is_canceled : session.is_canceled ? false : true,
            canceled_by: user.id
        }
        try{
            api.patch(`/api/sessions/${session.id}/action`, values).then((res)=>{
                if(res) {
                    alert('session modifié aves succees')
                    setRefreshKey(prev => prev + 1); 
                    setTrialSessions((prevSessions:any) => 
                        prevSessions.map((s:any) => 
                          s.id === session.id 
                            ? { ...s, is_canceled: session.is_canceled } // Remet l'état original
                        : s
                        ))
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
                        
                        {student.bio && (
                            <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Note Pédagogique</h3>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {student.bio}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        <div className={trialSessions && trialSessions.length > 0 &&`"bg-gray-100 p-3 rounded w-full"`}>
                        {trialSessions && trialSessions.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">Séances d'essai</h4>
                                {trialSessions.map((session: any) => (
                                <div key={session.id} className="bg-gray-50 p-3 rounded border flex justify-around">
                                    <span> 
                                        Seance d'essai le  :
                                    { getDate(session.date_slot)} - 

                                    </span>

                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                        session.is_canceled 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                        {session.is_canceled ? 'Annulée' : 'Active'}
                                    </span>

                                    <Button variant="outlined" color={session.is_canceled ? 'info': 'error'} size="small"  onClick={()=>sessionAction(session)} >
                                        <span className="text-xs">
                                            {session.is_canceled ? 'activer' : 'Annuler'}

                                        </span>
                                    </Button>
                                </div>
                                ))}
                            </div>
                        )}


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