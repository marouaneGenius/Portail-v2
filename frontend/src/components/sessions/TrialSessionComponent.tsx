import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/Hooks/auth";
import { RenderField, RenderTrialField } from "../forms/customInput";
import { TrialSession } from "@/forms/schemas";
import { SchoolSubjects } from "@/mocks/mocks";
import api from "@/api/aixos";
import { useNavigate } from "react-router-dom";
import { StudentInfoCard } from "./StudentInfoCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Sibling {
    id: number;
    firstname: string;
    lastname: string;
    class: string;
    email: string;
}

const TrialSessionComponent: React.FC<any> =  ({student}) => {
    const { user }:any = useAuth();
    const [values, setValues] = useState<Record<string, any>>({});
    const [fields, setFields] = useState<Record<string, any>>([]);
    const [siblings, setSiblings] = useState<Sibling[]>([]);
    const [selectedSiblings, setSelectedSiblings] = useState<number[]>([]);
    const [totalPrice, setTotalPrice] = useState(30);
    const [disablesdButtonUntilFindUser, setDisablesdButtonUntilFindUser] = useState(true);
    const navigate = useNavigate();

    const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked,  options }:any = e.target ;
    const multiple = e.target.multiple ;

    //pour gerer les select multiple
    setValues(prev => ({
    ...prev,
    [name]: multiple
        ? Array.from(options)
            .filter((opt:any) => opt.selected)
            .map((opt:any) => opt.value)
        : type === 'checkbox'
        ? checked
        : value,
    }));
    };


    useEffect(() => {
        if (values.tutor_id) {
            setDisablesdButtonUntilFindUser(false);
        } else {
            setDisablesdButtonUntilFindUser(true);
        }
    }, [values])

    const removeValueFromField = (field: any, value: any) => {
        setValues((prev: any) => ({
          ...prev,
          [field]: Array.isArray(prev[field])
            ? prev[field].filter((v: any) => (typeof v === 'object' ? v.value || v.id : v) !== (typeof value === 'object' ? value.value || value.id : value))
            : prev[field],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!student?.id) {
            alert("Erreur: Informations de l'étudiant manquantes");
            return;
        }
        
        const allStudentIds = [student.id, ...selectedSiblings];
        const newValues = {...values, 
            is_canceled:false, 
            session_type: 'trial_session',
            scheduled_by: user.email,
            student_ids: allStudentIds,
            stripe_number: student.stripe_key,
            payment_date: new Date().toISOString(),
            date_slot: new Date().toISOString(),
            total_price: totalPrice
        }

        try {
            api.post('/api/sessions/trial-session', newValues).then((res) => {
                if(res) {
                    alert(`Session d'essai créée avec succès pour ${allStudentIds.length} étudiant(s) - Total: ${totalPrice}€`)
                    // navigate(`/studentDetails/${student.id}`);
                }
            })
        } catch(e:any) {
            console.error('ERROR =>', e)
        }
        console.log("Données soumises:", newValues)
    }

    // Fonction pour récupérer les frères/sœurs
    const fetchSiblings = async () => {
        if (!student?.id) return;
        
        try {
            const response = await api.get(`/api/student/${student.id}/siblings`);
            setSiblings(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des frères/sœurs:', error);
            setSiblings([]);
        }
    };

    // Fonction pour gérer la sélection/désélection des frères
    const handleSiblingToggle = (siblingId: number) => {
        setSelectedSiblings(prev => {
            const updated = prev.includes(siblingId)
                ? prev.filter(id => id !== siblingId)
                : [...prev, siblingId];
            
            // Recalculer le prix total (30€ par étudiant)
            setTotalPrice((updated.length + 1) * 30); // +1 pour l'étudiant principal
            return updated;
        });
    };

    useEffect(() => {
        setFields(TrialSession.map((f) => {
            if (f.name === "school_subjects") {
                return { ...f, options: SchoolSubjects };
            }
            return f
        }))
        
        // Récupérer les frères/sœurs au chargement seulement si student existe
        if (student?.id) {
            fetchSiblings();
        }
    }, [student?.id]);

    // Vérification de sécurité
    if (!student) {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
                <div className="text-center py-8">
                    <p className="text-gray-500">Chargement des informations de l'étudiant...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <div className="mb-4">
                <h1 className="text-2xl font-bold mb-6">Créer une session d'essai Pour {`${student.firstname} ${student.lastname}`}</h1>
                <StudentInfoCard student={student} />

                {/* Section de sélection des frères/sœurs */}
                {siblings.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Frères et sœurs disponibles
                                <Badge variant="outline">
                                    Total: {totalPrice}€ ({selectedSiblings.length + 1} étudiant{selectedSiblings.length + 1 > 1 ? 's' : ''})
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {siblings.map((sibling) => (
                                    <div key={sibling.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                        <Checkbox
                                            id={`sibling-${sibling.id}`}
                                            checked={selectedSiblings.includes(sibling.id)}
                                            onCheckedChange={() => handleSiblingToggle(sibling.id)}
                                        />
                                        <label 
                                            htmlFor={`sibling-${sibling.id}`} 
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="font-medium">
                                                {sibling.firstname} {sibling.lastname}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Classe: {sibling.class} • {sibling.email}
                                            </div>
                                        </label>
                                        <Badge variant="secondary">+30€</Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800">
                                    <strong>Récapitulatif:</strong>
                                    <br />• {student.firstname} {student.lastname} (étudiant principal): 30€
                                    {selectedSiblings.length > 0 && (
                                        <>
                                            <br />• {selectedSiblings.length} frère{selectedSiblings.length > 1 ? 's' : ''}/sœur{selectedSiblings.length > 1 ? 's' : ''} sélectionné{selectedSiblings.length > 1 ? 's' : ''}: {selectedSiblings.length * 30}€
                                        </>
                                    )}
                                    <br /><strong>Total: {totalPrice}€</strong>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map((field:any) => (
                    <div key={field.name} className="space-y-2">
                        <RenderTrialField
                            f={field}
                            values={values}
                            setValues={setValues}
                            handleChange={handleChange}
                            removeValueFromField={removeValueFromField}
                            fieldName={field.name}
                            student={student}
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={disablesdButtonUntilFindUser}
                    className={disablesdButtonUntilFindUser ? 
                            "w-full bg-gray-300 text-white py-3 rounded-md hover:bg-blue-300 transition cursor-not-allowed" :
                            "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"}
                >
                    Créer la session d'essai ({selectedSiblings.length + 1} étudiant{selectedSiblings.length + 1 > 1 ? 's' : ''} - {totalPrice}€)
                </button>
            </form>
        </div>
      )
};

export default TrialSessionComponent;
