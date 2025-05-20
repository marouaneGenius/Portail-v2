import React, { ReactNode } from 'react';

interface CustomAlertProps {
  title?: string;
  message?: string;
  onClose?: () => void;
}

interface CustomComponentProps {
    value?:any
    currentkey?:any
    onRedirect?: (item:any) => void;
    open?:() => void;
}

export interface BrothersComponentProps {
  brothers: {
    id: number;
    firstname: string;
    lastname: string;
    [key: string]: any;
  }[];
}

export const CustomAlert: React.FC<CustomAlertProps> =  ({title, message, onClose}) => {
    return(
        <div className=" text-center py-4">
            <div className="p-2 bg items-center text-gray-800 leading-none lg:rounded-full flex lg:inline-flex w-full" role="alert" onClick={onClose}>
                <span className="flex rounded-full bg-green-400 uppercase px-2 py-1 text-xs font-bold mr-3 ">{title}</span>
                <span className="font-semibold mr-2 text-left flex-auto">{message}</span>
            </div>
        </div>
    )
}

export function CustomParentComponent({
    value,
    currentkey,
    onRedirect,
    open

  }: CustomComponentProps): React.ReactNode {
    if (currentkey !== 'parents' || !Array.isArray(value)) return null;
  
    // Afficher l'alerte si aucun parent
    if (value.length === 0) {
      return (
        <CustomAlert
          title="Attention !"
          message="L'élève n'a pas de parent ! Cliquez ici pour créer ou l'attacher."
          onClose={open}
        />
      );
    }
  
    // Colonnes sans `id`
    const columns = Object.keys(value[0]).filter((c) => c !== 'id');
  
    return (
      <div className="md:col-span-2">
        <dd className="mt-1 text-gray-700">
          <table className="w-full text-left text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-2 py-1 font-medium text-gray-600">
                    {col.replace('_', ' ')}
                  </th>
                ))}
                {/* Colonne pour le bouton */}
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {value.map((parent: Record<string, any>, idx: number) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {columns.map((col, i) => (
                    <td key={i} className="px-2 py-1">
                      {String(parent[col])}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-right">
                    <button
                      type="button"
                      onClick={() => onRedirect?.(`parent/${parent.id}`)}
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-green-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </dd>
      </div>
    );
}

export function CustomStudentsComponent({
    value,
    currentkey,
    onRedirect,
  }: CustomComponentProps): React.ReactNode {
    if (currentkey !== 'students' || !Array.isArray(value)) return null;
  
    // Afficher l'alerte si aucun parent
    if (value.length === 0) {
      return (
        <CustomAlert
          title="Attention !"
          message="L'élève n'a pas de parent ! Cliquez ici pour créer ou l'attacher."
        />
      );
    }
  
    const columns = Object.keys(value[0]).filter((c) => c !== 'id');
  
    return (
      <div className="md:col-span-2">
        <dd className="mt-1 text-gray-700">
          <table className="w-full text-left text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-2 py-1 font-medium text-gray-600">
                    {col.replace('_', ' ')}
                  </th>
                ))}
                {/* Colonne pour le bouton */}
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {value.map((parent: Record<string, any>, idx: number) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {columns.map((col, i) => (
                    <td key={i} className="px-2 py-1">
                      {String(parent[col])}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-right">
                    <button
                      type="button"
                      onClick={() => onRedirect?.(`student/${parent.id}`)}
                      className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-green-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </dd>
      </div>
    );
}

export const CustomReportsComponent: React.FC<CustomComponentProps> =  ({value, currentkey}) => {
    return (
        <>
            {currentkey === 'reports' && Array.isArray(value) && (
                <table className="w-full text-left text-sm mb-2">
                <thead className="bg-gray-100">
                    <tr>
                    {value.length > 0 &&
                        Object.keys(value[0]).map((col) => (
                        <th
                            key={col}
                            className="px-2 py-1 font-medium text-gray-600"
                        >
                            {col}
                        </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {value.map((row: Record<string, any>, idx: number) => (
                    <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                        {Object.values(row).map((cell, i) => (
                        <td key={i} className="px-2 py-1">
                            {String(cell)}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            )}

            { currentkey === 'reports' && value.length === 0 &&  (
                <CustomAlert title='Message !' message="Vous n'avez pas de Comptes rendu pour l'instant" onClose={open}/>
            )} 
        </>
    )
}

export const CustomTutorScheduleComponent: React.FC<CustomComponentProps> =  ({value, currentkey}) => {
    return (
        <>
            {currentkey === 'tutor_schedules' && Array.isArray(value) && (
                <table className="w-full text-left text-sm mb-2">
                <thead className="bg-gray-100">
                    <tr>
                    {value.length > 0 &&
                        Object.keys(value[0]).map((col) => (
                        <th
                            key={col}
                            className="px-2 py-1 font-medium text-gray-600"
                        >
                            {col}
                        </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {value.map((row: Record<string, any>, idx: number) => (
                    <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                        {Object.values(row).map((cell, i) => (
                        <td key={i} className="px-2 py-1">
                            {String(cell)}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            )}

            { currentkey === 'tutor_schedules' && value.length === 0 &&  (
                <CustomAlert title='Attention !' message="Vous n'avez pas de Creneau pour l'instant" onClose={open}/>
            )} 
        </>
    )
}

export const CustomSessionComponent: React.FC<CustomComponentProps> =  ({value, currentkey}) => {
    return (
        <>
            {currentkey === 'sessions' && Array.isArray(value) && (
                <table className="w-full text-left text-sm mb-2">
                <thead className="bg-gray-100">
                    <tr>
                    {value.length > 0 &&
                        Object.keys(value[0]).map((col) => (
                        <th
                            key={col}
                            className="px-2 py-1 font-medium text-gray-600"
                        >
                            {col}
                        </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {value.map((row: Record<string, any>, idx: number) => (
                    <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                        {Object.values(row).map((cell, i) => (
                        <td key={i} className="px-2 py-1">
                            {String(cell)}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            )}

            { currentkey === 'sessions' && value.length === 0 &&  (
                <CustomAlert title='Message!' message="Vous n'avez pas de Sessions pour l'instant" />
            )} 
        </>
    )
}

export const CustomCenterComponent: React.FC<CustomComponentProps> =  ({value, currentkey, onRedirect}) => {

    return (
        <>
           {value !== null && currentkey === 'center'&& value && 
                <div className=' text-lg w-full flex items-center justify-between h-16  p-4 rounded'>
                    <span>{ value.name } </span> 
                    <button type="button" 
                        onClick={() => onRedirect?.(`center/${value.id}`)}
                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-green-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                        Voir
                    </button>
                </div>
            }
              { currentkey === 'center' &&( !value||  value.length === 0 )&&  (
                <CustomAlert title='Message!' message="Vous n'avez pas de Centre pour l'instant" />
            )}{/*  */}
        </>
    )
}

export const CustomBrothersComponent: React.FC<BrothersComponentProps> = ({
  brothers,
}) => {

  return (
    <div className="mt-2 bg-gray-50 p-2">
      <h1 className='bg-border border-b-2  color-border p-4 mt-0 text-lg text-dark'>
      Frères et soeurs
      </h1>
      {brothers.map((bro) => (
        <div
          key={bro.id}
          className="flex items-center justify-between p-3 bg-gray-100 rounded shadow-sm"
        >
          <span className="font-medium text-slate-800">
            {bro.firstname} {bro.lastname}
          </span>

          <button
            type="button"
            className="py-2 px-4 text-xs font-semibold text-gray-900 bg-white rounded-lg border border-green-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
          >
            Voir
          </button>
        </div>
      ))}
        {
          brothers.length === 0 && 
          <CustomAlert title='Message!' message="l'élève n'a pas de Frères et soeurs" />
        }

    </div>
  );
};
