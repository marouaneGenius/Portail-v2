import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/Hooks/auth";
import { RenderField, RenderTrialField } from "../forms/customInput";
import { TrialSession } from "@/forms/schemas";
import { SchoolSubjects, ClassesOptionsLevel } from "@/mocks/mocks";
import api from "@/api/aixos";
import { useNavigate } from "react-router-dom";
import { StudentInfoCard } from "./StudentInfoCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { hasLevelForSubject, classLevel } from "../subscriptions/SubscriptionFunctions";

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
    const [currentConfigStep, setCurrentConfigStep] = useState(0); // 0 = étudiant principal, 1+ = frères
    const [studentsConfigs, setStudentsConfigs] = useState<{[key: number]: {subjects: string[], tutor_id?: number, scheduled_at?: string}}>({});
    const [totalPrice, setTotalPrice] = useState(30);
    const [availableTutors, setAvailableTutors] = useState<any[]>([]);
    const [filteredTutors, setFilteredTutors] = useState<any[]>([]);
    const [disablesdButtonUntilFindUser, setDisablesdButtonUntilFindUser] = useState(true);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const navigate = useNavigate();

    const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked,  options }:any = e.target ;
    const multiple = e.target.multiple ;

    // Si on change les matières, vider le tuteur sélectionné
    const shouldClearTutor = name === 'school_subjects';

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
    // Vider le tuteur si on change les matières
    ...(shouldClearTutor && { tutor_id: undefined })
    }));
    };


    useEffect(() => {
        const checkTutorValidation = async () => {
            if (values.tutor_id) {
                setDisablesdButtonUntilFindUser(false);
                // Vérification en temps réel seulement si des frères/sœurs sont sélectionnés
                if (values.school_subjects?.length && selectedSiblings.length > 0) {

                    const validation = await validateTutorForAllStudents(values.tutor_id, values.school_subjects);
                    setValidationErrors(validation.errors);
                } else {
                    // Pas de frères/sœurs = pas de validation nécessaire
                    setValidationErrors([]);
                }
            } else {
                setDisablesdButtonUntilFindUser(true);
                setValidationErrors([]);
            }

            if(values !== undefined && values.school_subjects !== undefined) {
                if(values.school_subjects.length ===0 || !values.scheduled_at) {
                    setDisablesdButtonUntilFindUser(true);
                } else {
                    setDisablesdButtonUntilFindUser(false);
                }
            }
        };

        checkTutorValidation();
    }, [values.tutor_id, values.school_subjects, selectedSiblings, student, filteredTutors])

    const removeValueFromField = (field: any, value: any) => {
        setValues((prev: any) => ({
          ...prev,
          [field]: Array.isArray(prev[field])
            ? prev[field].filter((v: any) => (typeof v === 'object' ? v.value || v.id : v) !== (typeof value === 'object' ? value.value || value.id : value))
            : prev[field],
        }));
    };

    // Fonction pour valider si le tuteur peut enseigner à tous les étudiants sélectionnés
    const validateTutorForAllStudents = async (tutorId: number, schoolSubjects: string[]) => {
        // Ne valider que s'il y a des frères/sœurs sélectionnés
        if (!tutorId || !schoolSubjects?.length || selectedSiblings.length === 0) {
            return { isValid: true, errors: [] };
        }

        try {
            // Récupérer les informations du tuteur
            const tutorResponse = await api.get(`/api/user/${tutorId}`);
            const tutor = tutorResponse.data;

            if (!tutor.class || tutor.class.length === 0) {
                return { isValid: false, errors: ["Le tuteur n'a pas de niveaux définis."] };
            }

            const errors: string[] = [];
            const allStudents = [
                { name: student.firstname + ' ' + student.lastname, class: student.class },
                ...selectedSiblings.map(siblingId => {
                    const sibling = siblings.find(s => s.id === siblingId);
                    return sibling ? { name: sibling.firstname + ' ' + sibling.lastname, class: sibling.class } : null;
                }).filter(Boolean)
            ];

            // Analyser chaque matière pour voir si elle peut être enseignée à tous les étudiants
            const subjectAnalysis: { [subject: string]: { canTeach: boolean, problems: string[] } } = {};
            
            schoolSubjects.forEach(subject => {
                const tutorSubjectLevel = tutor.class.find((tc: any) => tc.subject === subject);
                subjectAnalysis[subject] = { canTeach: true, problems: [] };
                
                if (!tutorSubjectLevel) {
                    subjectAnalysis[subject].canTeach = false;
                    subjectAnalysis[subject].problems.push("Matière non enseignée par le tuteur");
                } else {
                    allStudents.forEach((student:any) => {
                        const studentLevel = classLevel(student.class);
                        if (Number(tutorSubjectLevel.level) < Number(studentLevel)) {
                            const tutorMaxClass = ClassesOptionsLevel.find(c => c.level === tutorSubjectLevel.level)?.value || 'niveau inconnu';
                            subjectAnalysis[subject].canTeach = false;
                            subjectAnalysis[subject].problems.push(`${student.name} (${student.class}) - tuteur enseigne ${subject} jusqu'en ${tutorMaxClass} seulement`);
                        }
                    });
                }
            });

            // Vérifier s'il y a des problèmes
            const problematicSubjects = Object.keys(subjectAnalysis).filter(subject => !subjectAnalysis[subject].canTeach);
            
            if (problematicSubjects.length > 0) {
                problematicSubjects.forEach(subject => {
                    errors.push(`❌ **${subject.toUpperCase()}** : ${subjectAnalysis[subject].problems.join(', ')}`);
                });

                // Suggérer des solutions
                const workingSubjects = Object.keys(subjectAnalysis).filter(subject => subjectAnalysis[subject].canTeach);
                if (workingSubjects.length > 0) {
                    errors.push(`✅ **Matières possibles** : ${workingSubjects.join(', ')}`);
                    errors.push(`💡 **Suggestion** : Créez une session avec seulement ces matières, ou créez des sessions séparées par niveau.`);
                }
            }

            return { isValid: errors.length === 0, errors };
        } catch (error) {
            console.error('Erreur lors de la validation du tuteur:', error);
            return { isValid: false, errors: ["Erreur lors de la vérification des niveaux du tuteur."] };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!student?.id) {
            alert("Erreur: Informations de l'étudiant manquantes");
            return;
        }

        // Si on n'est pas à la dernière étape, on passe à l'étape suivante
        if (!isLastStep()) {
            goToNextStep();
            return;
        }

        // Si on est à la dernière étape, on sauvegarde la configuration actuelle puis on crée toutes les sessions
        const currentStudentId = getCurrentStudentId();
        const finalConfigs = {
            ...studentsConfigs,
            [currentStudentId]: {
                subjects: values.school_subjects || [],
                tutor_id: values.tutor_id,
                scheduled_at: values.scheduled_at
            }
        };

        try {
            const sessionsCreated = [];
            const allStudentIds = [student.id, ...selectedSiblings];

            // Préparer toutes les sessions à créer
            const sessionsToCreate = [];
            
            for (const studentId of allStudentIds) {
                const config = finalConfigs[studentId];
                if (!config) continue;

                const sessionData = {
                    school_subjects: config.subjects,
                    tutor_id: config.tutor_id,
                    scheduled_at: config.scheduled_at,
                    is_canceled: false,
                    session_type: 'trial_session',
                    scheduled_by: user.email,
                    student_id: studentId, // Un seul student_id par session
                    stripe_number: student.stripe_key,
                    payment_date: new Date().toISOString(),
                    date_slot: new Date().toISOString(),
                    total_price: 30
                };

                sessionsToCreate.push(sessionData);
                
                if (studentId === student.id) {
                    sessionsCreated.push(`${student.firstname} ${student.lastname}`);
                } else {
                    const sibling = siblings.find(s => s.id === studentId);
                    sessionsCreated.push(`${sibling?.firstname} ${sibling?.lastname}`);
                }
            }

            // Utiliser la nouvelle route groupée pour éviter les SMS multiples
            console.log('Utilisation de la route groupée pour éviter les SMS multiples');
            
            const groupedSessionData = {
                sessions: sessionsToCreate,
                total_price: totalPrice,
                parent_email: user.email,
                family_name: `Famille ${student.lastname}`
            };
            
            console.log('Création sessions groupées:', groupedSessionData);
            const response = await api.post('/api/sessions/trial-session-group', groupedSessionData);
            
            alert(`✅ Sessions créées avec succès pour:\n${sessionsCreated.join('\n')}\n\nTotal: ${totalPrice}€\n\n✅ Le parent recevra UN SEUL SMS avec le lien de paiement groupé!`);
            
            navigate(`/student/${student.id}`);

        } catch(e:any) {
            console.error('ERROR =>', e);
            alert('Erreur lors de la création des sessions d\'essai');
        }
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
            
            // Si on change la sélection de frères, réinitialiser le processus
            setCurrentConfigStep(0);
            setStudentsConfigs({});
            setValues({});
            
            // Recalculer le prix total (30€ par étudiant)
            setTotalPrice((updated.length + 1) * 30); // +1 pour l'étudiant principal
            return updated;
        });
    };

    // Fonction pour obtenir l'étudiant actuel en cours de configuration
    const getCurrentStudent = () => {
        if (currentConfigStep === 0) {
            return student;
        } else {
            const siblingIndex = currentConfigStep - 1;
            return siblings.find(s => s.id === selectedSiblings[siblingIndex]);
        }
    };

    // Fonction pour obtenir l'ID de l'étudiant actuel
    const getCurrentStudentId = () => {
        if (currentConfigStep === 0) {
            return student.id;
        } else {
            const siblingIndex = currentConfigStep - 1;
            return selectedSiblings[siblingIndex];
        }
    };

    // Fonction pour passer à l'étape suivante
    const goToNextStep = () => {

        const currentStudentId = getCurrentStudentId();
        
        // Sauvegarder la configuration actuelle
        setStudentsConfigs(prev => ({
            ...prev,
            [currentStudentId]: {
                subjects: values.school_subjects || [],
                tutor_id: values.tutor_id,
                scheduled_at: values.scheduled_at
            }
        }));

        // Réinitialiser COMPLÈTEMENT pour l'étape suivante
        setValues({}); // Vider le formulaire
        setFilteredTutors([]); // Vider les tuteurs filtrés
        setDisablesdButtonUntilFindUser(true); // Désactiver le bouton
        setValidationErrors([]); // Vider les erreurs de validation
        
        // Passer à l'étape suivante
        setCurrentConfigStep(prev => prev + 1);
        
        console.log('Passage à l\'étape suivante - tout réinitialisé');
    };

    useEffect(() => {
        console.log('values', values);

    }, [values])

    // Effet pour s'assurer que tout est réinitialisé lors du changement d'étape
    useEffect(() => {
        console.log('Changement d\'étape:', currentConfigStep);
        console.log('Tuteurs filtrés:', filteredTutors.length);
        console.log('Values actuels:', values);
    }, [currentConfigStep])

    // Fonction pour revenir à l'étape précédente
    const goToPreviousStep = () => {
        if (currentConfigStep > 0) {
            // D'abord changer l'étape
            const newStep = currentConfigStep - 1;
            setCurrentConfigStep(newStep);
            
            // Réinitialiser complètement
            setValues({});
            setFilteredTutors([]);
            setValidationErrors([]);
            setDisablesdButtonUntilFindUser(true);
            
            // Recharger la configuration de l'étape précédente si elle existe
            const prevStudentId = newStep === 0 ? student.id : selectedSiblings[newStep - 1];
            const prevConfig = studentsConfigs[prevStudentId];
            
            if (prevConfig) {
                // Attendre un petit moment pour que l'état se mette à jour, puis recharger
                setTimeout(() => {
                    setValues({
                        school_subjects: prevConfig.subjects || [],
                        tutor_id: prevConfig.tutor_id,
                        scheduled_at: prevConfig.scheduled_at
                    });
                }, 50);
            }
        }
    };

    // Vérifier si on est à la dernière étape
    const isLastStep = () => {
        return currentConfigStep >= selectedSiblings.length;
    };

    // Fonction pour filtrer les tuteurs selon les matières sélectionnées
    const filterTutorsBySubjects = (selectedSubjects: string[]) => {

        if (!selectedSubjects || selectedSubjects.length === 0) {
            console.log('Aucune matière - arrêt du filtrage');
            setFilteredTutors([]);
            return;
        }

        const currentStudent = getCurrentStudent();
        
        if (!currentStudent) {
            console.log('Pas d\'étudiant actuel - arrêt du filtrage');
            setFilteredTutors([]);
            return;
        }

        // Vérifier que l'étudiant a un centre
        if (!currentStudent.centers || !currentStudent.centers.name) {
            console.log('Étudiant sans centre - utilisation du centre de l\'étudiant principal');
            // Utiliser le centre de l'étudiant principal si le frère n'en a pas
            if (currentConfigStep > 0 && student.centers) {
                currentStudent.centers = student.centers;
                console.log('Centre assigné depuis l\'étudiant principal:', currentStudent.centers);
            } else {
                console.log('Impossible de déterminer le centre - arrêt du filtrage');
                setFilteredTutors([]);
                return;
            }
        }

        const filtered = availableTutors.filter((tutor) => {
            console.log(`--- Vérification tuteur: ${tutor.firstname} ${tutor.lastname} ---`);
            console.log('Matières du tuteur:', tutor.school_subjects);
            console.log('Centres/événements du tuteur:', tutor.centers, tutor.events);
            
            // Vérifier que le tuteur enseigne dans le centre de l'étudiant
            const hasCenterMatch = tutor.centers && tutor.centers.length !== 0 && tutor.events && tutor.events.length !== 0 && 
                tutor.events.find((event:any) => { 
                    if(event.centers && event.centers.name && currentStudent.centers && currentStudent.centers.name) {
                        return event.centers.name === currentStudent.centers.name;
                    }
                    return false;
                });
                
            if (!hasCenterMatch) {
                console.log('Tuteur ne correspond pas au centre - rejeté');
                return false;
            }
            
            if (!tutor.school_subjects || tutor.school_subjects.length === 0) {
                console.log('Tuteur sans matières - rejeté');
                return false;
            }

            // Vérifier si le tuteur enseigne au moins une des matières sélectionnées
            const tutorSubjects = tutor.school_subjects.map((s: string) => s.toLowerCase());
            const hasMatchingSubjects = selectedSubjects.some(subject => 
                tutorSubjects.includes(subject.toLowerCase())
            );

            console.log('Matières correspondent?', hasMatchingSubjects);

            if (!hasMatchingSubjects) {
                console.log('Aucune matière correspondante - rejeté');
                return false;
            }

            // Vérifier si le tuteur peut enseigner au niveau de l'étudiant
            if (tutor.class && tutor.class.length > 0) {
                const canTeach = hasLevelForSubject(tutor, currentStudent.class, selectedSubjects);
                console.log('Peut enseigner ce niveau?', canTeach);
                return canTeach;
            }

            console.log('Tuteur accepté (pas de vérification de niveau)');
            return true;
        });

        console.log(`=== RÉSULTAT: ${filtered.length} tuteurs filtrés ===`);
        console.log('Tuteurs filtrés:', filtered.map(t => `${t.firstname} ${t.lastname}`));
        
        setFilteredTutors(filtered);
    };

    // Charger tous les tuteurs au démarrage
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const response = await api.get('/api/user/tutors');
                setAvailableTutors(response.data || []);
            } catch (error) {
                console.error('Erreur lors du chargement des tuteurs:', error);
                setAvailableTutors([]);
            }
        };

        fetchTutors();
    }, []);

    // Filtrer les tuteurs quand les matières changent
    useEffect(() => {
        console.log('Filtrage des tuteurs - Matières:', values.school_subjects);
        console.log('Tuteurs disponibles:', availableTutors.length);
        
        if (values.school_subjects && values.school_subjects.length > 0) {
            console.log('Déclenchement du filtrage...');
            filterTutorsBySubjects(values.school_subjects);
        } else {
            console.log('Aucune matière - vidage des tuteurs filtrés');
            setFilteredTutors([]);
        }
    }, [values.school_subjects, availableTutors]);

    useEffect(() => {
        console.log('Mise à jour des fields - filteredTutors:', filteredTutors.length);
        console.log('Matières sélectionnées:', values.school_subjects);
        
        const baseFields = TrialSession.map((f) => {
            if (f.name === "school_subjects") {
                return { ...f, options: SchoolSubjects };
            }
            return f
        });

        // N'ajouter le champ tuteur QUE si des matières sont sélectionnées
        const hasSelectedSubjects = values.school_subjects && values.school_subjects.length > 0;
        
        let updatedFields = [...baseFields];
        
        if (hasSelectedSubjects) {
            const tutorField = {
                name: 'tutor_id',
                label: 'Tuteur',
                type: 'select' as const,
                required: true,
                options: filteredTutors.map(tutor => ({
                    value: tutor.id,
                    label: `${tutor.firstname} ${tutor.lastname}`
                }))
            };
            updatedFields = [...baseFields, tutorField];
            console.log('Champ tuteur ajouté avec', tutorField.options.length, 'tuteurs');
        } else {
            console.log('Aucune matière sélectionnée - champ tuteur caché');
        }
        
        setFields(updatedFields);
        
        // Récupérer les frères/sœurs au chargement seulement si student existe
        if (student?.id && currentConfigStep === 0) {
            fetchSiblings();
        }
    }, [student?.id, filteredTutors, currentConfigStep, values.school_subjects]);

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
                {/* Indicateur d'étape */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Sessions d'essai - Configuration</h1>
                        <Badge variant="secondary">
                            Étape {currentConfigStep + 1} sur {selectedSiblings.length + 1}
                        </Badge>
                    </div>
                    
                    {/* Indicateur de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentConfigStep + 1) / (selectedSiblings.length + 1)) * 100}%` }}
                        ></div>
                    </div>
                    
                    {/* Nom de l'étudiant actuel */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-800">
                            Configuration pour: {getCurrentStudent()?.firstname} {getCurrentStudent()?.lastname}
                            {currentConfigStep === 0 && <span className="text-sm font-normal"> (étudiant principal)</span>}
                        </h2>
                        <p className="text-sm text-blue-600 mt-1">
                            Choisissez d'abord les matières, puis un tuteur sera proposé parmi ceux qui enseignent ces matières.
                        </p>
                    </div>
                </div>
                
                <StudentInfoCard student={getCurrentStudent()} />

                {/* Section de sélection des frères/sœurs (seulement à l'étape 0) */}
                {siblings.length > 0 && currentConfigStep === 0 && (
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
                            {selectedSiblings.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-blue-800">
                                        <strong>Étudiants sélectionnés:</strong>
                                        <br />• {student.firstname} {student.lastname} (étudiant principal)
                                        {selectedSiblings.map(siblingId => {
                                            const sibling = siblings.find(s => s.id === siblingId);
                                            return (
                                                <div key={siblingId}>
                                                    <br />• {sibling?.firstname} {sibling?.lastname}
                                                </div>
                                            );
                                        })}
                                        <br /><strong>Total: {totalPrice}€</strong>
                                        <br /><span className="text-xs">Vous configurerez chaque étudiant individuellement.</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Récapitulatif des configurations déjà faites (pour les étapes > 0) */}
                {currentConfigStep > 0 && Object.keys(studentsConfigs).length > 0 && (
                    <Card className="mb-6 border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="text-green-800">Configurations terminées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.entries(studentsConfigs).map(([studentId, config]) => {
                                const isMainStudent = parseInt(studentId) === student.id;
                                const studentInfo = isMainStudent 
                                    ? student 
                                    : siblings.find(s => s.id === parseInt(studentId));
                                
                                return (
                                    <div key={studentId} className="flex items-center justify-between p-2 border-b border-green-200 last:border-b-0">
                                        <div>
                                            <span className="font-medium text-green-800">
                                                {studentInfo?.firstname} {studentInfo?.lastname}
                                                {isMainStudent && <span className="text-xs"> (principal)</span>}
                                            </span>
                                            <div className="text-xs text-green-600">
                                                Matières: {config.subjects.join(', ')}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-green-700 border-green-300">✓</Badge>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Section d'affichage des erreurs de validation */}
                {validationErrors.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-800 flex items-center">
                                ⚠️ Problèmes de compatibilité détectés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {validationErrors.map((error, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <span className="text-red-600 font-bold mt-1">•</span>
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 p-3 bg-red-100 rounded-lg">
                                <p className="text-red-800 text-sm font-medium">
                                    💡 <strong>Solutions possibles :</strong>
                                </p>
                                <ul className="text-red-700 text-sm mt-1 space-y-1">
                                    <li>• Choisir un autre tuteur</li>
                                    <li>• Modifier les matières sélectionnées</li>
                                    <li>• Désélectionner certains frères/sœurs</li>
                                    <li>• Créer des sessions séparées par niveau</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Information sur les tuteurs disponibles - N'afficher QUE si des matières sont sélectionnées */}
            {values.school_subjects && values.school_subjects.length > 0 && (
                <div className="mb-4">
                    {filteredTutors.length > 0 ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-sm font-medium text-green-800 mb-1">
                                ✅ {filteredTutors.length} tuteur{filteredTutors.length > 1 ? 's' : ''} disponible{filteredTutors.length > 1 ? 's' : ''}
                            </h3>
                            <p className="text-xs text-green-600">
                                Pour les matières: {values.school_subjects.join(', ')}
                            </p>
                        </div>
                    ) : (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <h3 className="text-sm font-medium text-orange-800 mb-1">
                                ⚠️ Aucun tuteur disponible
                            </h3>
                            <p className="text-xs text-orange-600">
                                Aucun tuteur ne peut enseigner les matières sélectionnées ({values.school_subjects.join(', ')}) au niveau {getCurrentStudent()?.class}. 
                                Essayez de modifier votre sélection de matières.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map((field:any) => (
                    <div key={`${field.name}-step-${currentConfigStep}`} className="space-y-2">
                        <RenderTrialField
                            f={field}
                            values={values}
                            setValues={setValues}
                            handleChange={handleChange}
                            removeValueFromField={removeValueFromField}
                            fieldName={field.name}
                            student={getCurrentStudent()}
                        />
                    </div>
                ))}
                <div className="flex gap-3">
                    {/* Bouton Précédent */}
                    {currentConfigStep > 0 && (
                        <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 transition"
                        >
                            ← Précédent
                        </button>
                    )}
                    
                    {/* Bouton Suivant/Créer */}
                    <button
                        type="submit"
                        disabled={disablesdButtonUntilFindUser || validationErrors.length > 0}
                        className={`${currentConfigStep > 0 ? 'flex-1' : 'w-full'} ${
                            disablesdButtonUntilFindUser || validationErrors.length > 0 ? 
                            "bg-gray-300 text-white py-3 rounded-md hover:bg-blue-300 transition cursor-not-allowed" :
                            "bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                        }`}
                    >
                        {validationErrors.length > 0 
                            ? "⚠️ Problèmes de compatibilité à résoudre"
                            : isLastStep()
                            ? `Créer les ${selectedSiblings.length + 1} sessions d'essai (${totalPrice}€)`
                            : `Suivant : ${siblings.find(s => s.id === selectedSiblings[currentConfigStep])?.firstname || 'Étudiant suivant'} →`
                        }
                    </button>
                </div>
            </form>
        </div>
      )
};

export default TrialSessionComponent;
