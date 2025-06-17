interface DetailProps {
    label: string;
    value: string;
    onUpdate: boolean
    handleChange(e:any): void
    fieldName:any;
    spanClass:string
  }
  
  export const Detail: React.FC<DetailProps> = ({ label, value, onUpdate, handleChange, fieldName, spanClass }) => (
    <div  className={`space-y-2  ${spanClass}`}>
      <h3 className="text-sm font-medium text-gray-600 flex items-center">
        {label} 
      </h3>
  
      {onUpdate  ?
            <input className="text-base text-slate-900 dark:text-slate-200 break-all p-2 w-full  border-2 rounded"
              defaultValue={value}
              onChange={handleChange}  
              name={fieldName} 
            />
        :
        <p className="p-3 bg-gray-50 rounded-lg border">
        {value}
        </p>
      }
    </div>
  );