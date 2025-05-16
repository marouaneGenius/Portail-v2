interface DetailProps {
    label: string;
    value: string;
    onUpdate: boolean
    handleChange(e:any): void
    fieldName:any;
    spanClass:string
  }
  
  export const Detail: React.FC<DetailProps> = ({ label, value, onUpdate, handleChange, fieldName, spanClass }) => (
    <div  className={`space-y-1 bg-gray-100 rounded ${spanClass}`}>
      <h3 className="text-sm font-semibold text-slate-900  bg p-3 border-b-2 color-border">
        {label} 
      </h3>
  
      {onUpdate  ?
            <input className="text-base text-slate-900 dark:text-slate-200 break-all p-2 w-full bg-gray-100 border-2 border-gray-400 rounded"
              defaultValue={value}
              onChange={handleChange}  
              name={fieldName} 
            />
        :
        <p className="text-base text-slate-900 dark:text-slate-200 break-all p-2">
        {value}
        </p>
      }
    </div>
  );