import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/auth";
import api from "../api/aixos";
import { useAlert } from '../Hooks/useAlert';
import Modal from '../components/Modal';
import Alert, { AlertMessage } from "../components/Alert";
import { Detail } from "../components/CustomInputField";
import { validatePasswords } from "../services/functions";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [updateMode, setUpdateMode] = useState(false);
  const [updatePasswordMode, setUpdatePasswordMode] = useState(false);
  const [values, setValues] = useState<Record<string, any>>();
  const { isOpen, open, close } = useAlert();
  const [passwordErrorMesssage, setpasswordErrorMesssage] = useState(false);
  const [errorMesssage, setErrorMesssage] = useState('');
  const [enableSaveButton, setEnableSaveButton] = useState(true);


  const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked }:any = e.target;
    const newValues:any = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(newValues);
    if (name === "password" || name === "confirm_password") {
      const  errors:any  = validatePasswords(newValues?.password, newValues.confirm_password);
      setpasswordErrorMesssage(true)
      if(errors.isValid) {
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


  const safeNeWProfileUserData = async(e: FormEvent) => {
    e.preventDefault();
    if(values?.password || values?.confirm_password) {
      if( (values?.password && !values?.confirm_password )|| (values?.confirm_password  && !values?.password ) ){
        setpasswordErrorMesssage(true)
        setErrorMesssage('Faut remplir les 2 champs !')
      } else{
        setpasswordErrorMesssage(false)
        try {
          const { data: updated } = await api.put(`/api/user/${user?.id}/password`, values);
          setUpdatePasswordMode(false)
        } catch(e:any) {
          setpasswordErrorMesssage(true)
          console.error('erreur lors de la modification du profile',e.response.data.errors)
          if(e.response.data.error){
            setErrorMesssage(e.response.data.error)
          } else {
            setErrorMesssage('Un probleme est survenu lors de la modification du mot de passe !')
          }
        }
      }
    }else {
      try {
        const { data: updated } = await api.put(`/api/user/${user?.id}`, values);
        updateUser(updated);
        setUpdateMode(false)
      } catch(e:any) {
        console.error('erreur lors de la modification du profile',e)
      }
    }
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen  flex justify-center items-start py-16 px-4">
      <div className="relative w-full max-w-3xl p-[1px] rounded-2xl gardient-border shadow-lg">
        <div className="rounded-2xl bg-white light:bg-slate-300 p-8 md:p-12">
          <div className="flex flex-col items-center text-center gap-3 mb-10">
            <div className="h-24 w-24 rounded-full p-[3px] gardient-border">
              <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-3xl font-semibold text-slate-600 dark:text-slate-200">
                {user.firstname ? user.firstname[0] : user.email[0]}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {user.firstname || "Utilisateur"} {user.lastname}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>

          <form onSubmit={safeNeWProfileUserData}>
            <div className="grid grid-cols-1 grid-cols-2 gap-2">

              {
                !updatePasswordMode  &&
                <>
                {user.firstname && <Detail label="Prénom" value={user.firstname} onUpdate={updateMode} handleChange={handleChange} fieldName={'firstname'} spanClass={'col-span-1'} />}
                {user.lastname && <Detail label="Nom" value={user.lastname} onUpdate={updateMode} handleChange={handleChange} fieldName={'lastname'} spanClass={'col-span-1'}/>}
                <Detail label="Email" value={user.email} onUpdate={updateMode}  handleChange={handleChange} fieldName={'email'} spanClass={'col-span-2'} />
                </>
              }
              {
                !updateMode && updatePasswordMode &&
                <>
                  <Detail label="Mot de passe" value={''} onUpdate={updatePasswordMode} handleChange={handleChange} fieldName={'password'} spanClass={'col-span-2'} />
                  <Detail label="Confirmer le Mot de passe" value={''} onUpdate={updatePasswordMode} handleChange={handleChange} fieldName={'confirm_password'} spanClass={'col-span-2'} />
                </>
              }
               { passwordErrorMesssage &&  <AlertMessage message={errorMesssage} /> }
              {/* Roles spanning both cols */}
              {user.roles && user.roles.length > 0 && (
                <div className="md:col-span-2 flex flex-wrap items-center gap-2  p-2 rounded">
              {/* Titre plein largeur */}
                <h3 className="basis-full text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Rôles
                </h3>
                {/* Badges */}
                {user.roles.map((role: string) => (
                  <span
                    key={role}
                    className="inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow"
                  >
                    {role}
                  </span>
                ))}
              </div>
              )}
            </div>
            <div className=" flex mt-4">
              {
                  updateMode && !updatePasswordMode &&
                  <>
                    <button
                      type="submit"
                      className="ml-auto py-2.5 px-5 text-sm font-medium text-orange-400 border-2 border-orange-200   rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Enregistrer
                    </button>
                  
                    <button
                      type="button"
                      onClick={() => setUpdateMode(false)}
                      className="ml-auto py-2.5 px-5 text-sm font-medium text-orange-400 border-2 border-orange-200   rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Annuler
                    </button>
                  </>
                }
                {
                  !updateMode && !updatePasswordMode &&
                  <button
                    type="button"
                    onClick={()=> setUpdateMode(true)}
                    className="ml-auto py-2.5 px-5 text-sm font-medium text-orange-400 border-2 border-orange-200   rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  >
                    Modifier
                  </button>
                }

                {
                  !updateMode && updatePasswordMode &&
                  <>
                    <button
                      type="submit"
                      disabled={enableSaveButton}
                      className="ml-auto py-2.5 px-5 text-sm font-medium text-orange-400 border-2 border-orange-200   rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Enregistrer le mot de passe
                    </button>
                  
                    <button
                      type="button"
                      onClick={() => setUpdatePasswordMode(false)}
                      className="ml-auto py-2.5 px-5 text-sm font-medium text-orange-400 border-2 border-orange-200   rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Annuler
                    </button>
                  </>
                }
                {
                  !updateMode && !updatePasswordMode &&
                  <button
                    type="button"
                    onClick={()=> setUpdatePasswordMode (true)}
                    className="ml-auto py-2.5 px-5 text-sm font-medium text-orange-400 border-2 border-orange-200   rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  >
                    Modifier le mot de passe
                  </button>
                }
             
              </div>
          </form>
          <Alert 
              title="Alert!" 
              isOpen={isOpen} 
              onClose={close} 
              message="Vous allez etre deconnecter si vous enregistrer les données"
              footer={
                <>
                    <button
                    onClick={close}
                    className="px-4 py-2 bg-orange-200 rounded hover:bg-gray-300 border-2 border-orange-500 rounded-b"
                    >
                    Fermer
                    </button>
                </>
            }  />
        </div>
      </div>
    </div>
  );
};



export default Profile;
