import { useState } from "react";

export default function ParentFormOrModal({
  emptyFields,
  currenParentFields,
  values,
  handleChange,
  getParent,
  ParentSelector,
}:any) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mb-8 w-full mt-3">
      <button
        className="mb-4 px-4 py-2 w-full rounded bg-[#FFB800] text-white font-semibold shadow hover:bg-[#FFA800] transition"
        onClick={() => setShowModal((v) => !v)}
        type="button"
      >
        {showModal ? "Creer le parent" : "Chercher le parent"}
      </button>

      {showModal ? (
        <ParentSelector onClose={() => setShowModal(false)} updateItem={getParent} />
      ) : (
        emptyFields && (
          <div className="bg-[#F9F9F9] p-6 rounded-xl border border-[#FFD47A] shadow-sm w-full">
            <h1 className="col-span-2 text-lg font-semibold bg-[#F2F2F2] text-center rounded p-2 border-b-2 border-[#FFB800] my-3">
              Ajouter le Parent
            </h1>
            {currenParentFields.map((f:any) => (
              <div key={f.name} className={f.className ?? ""}>
                <label
                  htmlFor={f.name}
                  className="block text-xs font-semibold text-[#333333] mb-1 bg-[#F2F2F2] px-2 py-2 rounded"
                >
                  {f.label}
                </label>
                {f.type === "select" ? (
                  <select
                    id={f.name}
                    name={f.name}
                    value={values[f.name] || ""}
                    onChange={handleChange}
                    className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333] text-sm"
                    required={!!f.required}
                  >
                    <option value="">—</option>
                    {(f.options || []).map((opt:any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    checked={f.type === "checkbox" ? values[f.name] : undefined}
                    value={f.type !== "checkbox" ? values[f.name] || "" : undefined}
                    onChange={handleChange}
                    className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333] text-sm"
                    required={!!f.required}
                  />
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
