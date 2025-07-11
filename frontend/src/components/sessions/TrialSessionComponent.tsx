import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/Hooks/auth";
import { RenderField, RenderTrialField } from "../forms/customInput";
import { TrialSession } from "@/forms/schemas";
import { SchoolSubjects } from "@/mocks/mocks";
import api from "@/api/aixos";
import { useNavigate } from "react-router-dom";
import { StudentInfoCard } from "./StudentInfoCard";

const TrialSessionComponent: React.FC<any> =  ({student}) => {
    const { user }:any = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, any>>({});
    const [fields, setFields] = useState<Record<string, any>>([]);
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
        const newValues = {...values, 
            is_canceled:false, 
            session_type: 'trial_session',
            scheduled_by: user.email,
            student_ids: [student.id],
            stripe_number: student.stripe_key,
            payment_date: new Date().toISOString(),
            date_slot: new Date().toISOString()
        }

        try {
            api.post('/api/sessions', newValues).then((res) => {
                if(res) {
                    alert("Session d'essai cree avec succes")
                    navigate(`/studentDetails/${student.id}`);
                }
            })
        } catch(e:any) {
            console.error('ERROR =>', e)
        }
        // console.log("Données soumises:", newValues)
    }

    useEffect(() => {
        setFields(TrialSession.map((f) => {
            if (f.name === "school_subjects") {
                return { ...f, options: SchoolSubjects };
            }
            return f
        }))
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            {
                student && <div className="mb-4">
                        <h1 className="text-2xl font-bold mb-6">Créer une session d'essai Pour {`${student.firstname} ${student.lastname}`}</h1>
                       <StudentInfoCard student={student} />

                </div>
            }
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
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                >
                    Créer la session
                </button>
            </form>
    
          {/* Optionnel: Aperçu des valeurs */}
            <div className="mt-8 p-4 bg-gray-50 rounded">
                <h2 className="text-lg font-semibold mb-2">Valeurs actuelles:</h2>
                <pre className="text-sm">{JSON.stringify(values, null, 2)}</pre>
            </div>
        </div>
      )
};

export default TrialSessionComponent;
