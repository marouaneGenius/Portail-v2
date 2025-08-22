import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../Hooks/auth";
import api from "../api/aixos";
import { useAlert } from '../Hooks/useAlert';
import Alert, { AlertMessage } from "../components/Alert";
import { Detail } from "../components/CustomInputField";
import { validatePasswords } from "../services/functions";
import { Edit, Key, Save, Ban, User, Mail, Phone, Building, Shield, Camera, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { usePermissions } from "@/Hooks/usePermissions";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [updateMode, setUpdateMode] = useState(false);
  const [updatePasswordMode, setUpdatePasswordMode] = useState(false);
  const [values, setValues] = useState<Record<string, any>>();
  const { isOpen, open, close } = useAlert();
  const [passwordErrorMesssage, setpasswordErrorMesssage] = useState(false);
  const [errorMesssage, setErrorMesssage] = useState('');
  const [enableSaveButton, setEnableSaveButton] = useState(true);
  const { hasPermission, hasRole, isParent } = usePermissions();
  

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked }: any = e.target;
    const newValues: any = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(newValues);
    if (name === "password" || name === "confirm_password") {
      const errors: any = validatePasswords(newValues?.password, newValues.confirm_password);
      setpasswordErrorMesssage(true)
      if (errors.isValid) {
        setpasswordErrorMesssage(false)
        setEnableSaveButton(false)
      } else {
        setErrorMesssage(errors.errors[0])
        setpasswordErrorMesssage(true)
      }
    }
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const safeNeWProfileUserData = async (e: FormEvent) => {
    e.preventDefault();
    if (values?.password || values?.confirm_password) {
      if ((values?.password && !values?.confirm_password) || (values?.confirm_password && !values?.password)) {
        setpasswordErrorMesssage(true)
        setErrorMesssage('Faut remplir les 2 champs !')
      } else {
        setpasswordErrorMesssage(false)
        try {
          const endpoint = isParent() ? `/api/parents/${user?.id}/password` : `/api/user/${user?.id}/password`;
          const { data: updated } = await api.put(endpoint, values);
          setUpdatePasswordMode(false)
          toast.success('Votre mot de passe a bien été mis à jour.');
        } catch (e: any) {
          setpasswordErrorMesssage(true)
          if (e.response.data.error) {
            setErrorMesssage(e.response.data.error)
          } else {
            setErrorMesssage('Un probleme est survenu lors de la modification du mot de passe !')
          }
        }
      }
    } else {
      try {
        const { data: updated } = await api.put(`/api/user/${user?.id}`, values);
        updateUser(updated);
        setUpdateMode(false)
        toast.success('Profil mis à jour avec succès !');
      } catch (e: any) {
        // Affiche une alerte ou toast ici si besoin
        toast.error('Une erreur est survenue lors de la modification du profil.');
      }
    }
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Bouton retour pour les parents */}
          {isParent() && (
            <Link to="/parent-dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
          )}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-hello-yellow to-crazy-magenta rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-dat-white" />
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-mister-anthracite hover:bg-mister-anthracite/90 rounded-full flex items-center justify-center"
              title="Changer la photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-mister-anthracite">Mon profil</h1>
            <div className="flex items-center gap-2 text-sm text-mister-anthracite/70">
              <Shield className="w-4 h-4" />
              {user.roles && user.roles.length > 0 && (
                <span>{user.roles[0].replace('ROLE_', '')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <div className="border-fading-grey rounded-xl bg-white shadow">
            <div className="p-6">
              <form onSubmit={safeNeWProfileUserData}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!updatePasswordMode && (
                    <>
                      {user.firstname && <Detail label="Prénom" value={user.firstname} onUpdate={updateMode} handleChange={handleChange} fieldName={'firstname'} spanClass={'col-span-1'} />}
                      {user.lastname && <Detail label="Nom" value={user.lastname} onUpdate={updateMode} handleChange={handleChange} fieldName={'lastname'} spanClass={'col-span-1'} />}
                      <Detail label="Email" value={user.email} onUpdate={updateMode} handleChange={handleChange} fieldName={'email'} spanClass={'col-span-2'} />
                    </>
                  )}
                  {!updateMode && updatePasswordMode && (
                    <>
                      <Detail label="Mot de passe" value={''} onUpdate={updatePasswordMode} handleChange={handleChange} fieldName={'password'} spanClass={'col-span-2'} />
                      <Detail label="Confirmer le Mot de passe" value={''} onUpdate={updatePasswordMode} handleChange={handleChange} fieldName={'confirm_password'} spanClass={'col-span-2'} />
                    </>
                  )}
                  {passwordErrorMesssage && <AlertMessage message={errorMesssage} />}
                </div>
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {/* Mode édition profil */}
                  {updateMode && !updatePasswordMode && (
                    <>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-hello-yellow hover:bg-hello-yellow/90 focus:outline-none focus:ring-2 focus:ring-hello-yellow/30 rounded-lg transition"
                      >
                        <Save className="h-4 w-4" />
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpdateMode(false)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg transition"
                      >
                        <Ban className="h-4 w-4" />
                        Annuler
                      </button>
                    </>
                  )}
                  {/* Mode édition mot de passe */}
                  {!updateMode && updatePasswordMode && (
                    <>
                      <button
                        type="submit"
                        disabled={enableSaveButton}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                          enableSaveButton
                            ? 'bg-orange-200 text-white cursor-not-allowed'
                            : 'bg-hello-yellow text-mister-anthracite hover:bg-hello-yellow/90 focus:outline-none focus:ring-2 focus:ring-hello-yellow/30'
                        }`}
                      >
                        <Save className="h-4 w-4" />
                        Enregistrer le mot de passe
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpdatePasswordMode(false)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg transition"
                      >
                        <Ban className="h-4 w-4" />
                        Annuler
                      </button>
                    </>
                  )}
                  {/* Mode lecture */}
                  {!updateMode && !updatePasswordMode &&(
                    <>


                    {  (user?.roles &&  hasRole(user?.roles[0]) && user?.roles[0] !== 'ROLE_TUTOR' && !user?.roles.includes('ROLE_PARENT') ) &&

                      <button
                        type="button"
                        onClick={() => setUpdateMode(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-hello-yellow border border-hello-yellow bg-white hover:bg-hello-yellow/10 focus:outline-none focus:ring-2 focus:ring-hello-yellow/30 rounded-lg transition"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </button>
                    }

                      <button
                        type="button"
                        onClick={() => setUpdatePasswordMode(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-hello-yellow border border-hello-yellow bg-white hover:bg-hello-yellow/10 focus:outline-none focus:ring-2 focus:ring-hello-yellow/30 rounded-lg transition"
                      >
                        <Key className="h-4 w-4" />
                        Modifier le mot de passe
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Informations du compte */}
        <div className="space-y-4">
          <div className="border-fading-grey rounded-xl bg-white shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-fading-grey/50">
                <Mail className="w-4 h-4 text-hello-yellow" />
                <div>
                  <p className="text-sm font-medium text-mister-anthracite">Email vérifié</p>
                  <p className="text-xs text-mister-anthracite/60">Compte activé</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-fading-grey/50">
                <Shield className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-mister-anthracite">{user.roles && user.roles[0] ? user.roles[0].replace('ROLE_', '') : "Rôle inconnu"}</p>
                  <p className="text-xs text-mister-anthracite/60">Accès complet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Alert
        title="Alert!"
        isOpen={isOpen}
        onClose={close}
        message="Vous allez etre deconnecter si vous enregistrer les données"
        footer={
          <button
            onClick={close}
            className="px-4 py-2 bg rounded hover:bg-gray-300 border-2 color-border rounded-b"
          >
            Fermer
          </button>
        }
      />
    </div>
  );
};

export default Profile;
