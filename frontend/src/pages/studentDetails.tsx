import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/aixos";
import { useParams } from "react-router-dom";
import { DetailPageParams } from "../components/ItemDetails";
import { ActionGrid } from "../components/CustomAlert";
import { getDate } from "../services/functions";
import { GradientCard } from "../components/GardientCard";

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
}
  
  export const StudentDetails: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { resource, id } = useParams<DetailPageParams>();
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState<StudentItem>();

    useEffect(() => {
        // if (!resource || !id) return;
        setLoading(true);
        api.get(`/api/student/${id}`)
          .then(({ data }:any) => {
            console.log(data)
            setStudent(data);
          })
          .catch((err:any) => {
            setError(err.response?.data?.message || 'Erreur de chargement');
          })
          .finally(() => setLoading(false));
    }, [resource, id]);
  
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