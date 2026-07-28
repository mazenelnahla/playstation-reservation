import React from "react";
import Label from "./Label";
type RecordItem = {
  id: string; // internal uuid key
  ElQadya_Number: string;
  Rank: string;
  Elmotaham_Name: string;
  Elwe7da: string;
  Qarar_Eletham: string;
  Hay2t_elma7kama: string;
  El7okm: string;
  Tare5_Wrod_Eltasdy2: string;
  Ra2y_Far3_Qesm_Eltasdeq: string;
  Qarar_Elzabet_Almosad2: string;
  Gehat_E5tar_beqarar_Elzabet: string;
  Tare5_Ale3lan_Bel7okm: string;
  Asmaa_Elta3neen: string;
  Tare5_Ta2deem_Eltemas: string;
  Qarar_Elzabet_Ela3la_MenELmosad2: string;
  Assm_Elzabet_Alazy_Ba7s_Elta3n: string;
  Mola7zat: string;
};
interface SelectFieldProps {
  id: keyof RecordItem | string;
  info:string;
  label: string;
  labelClassName?: string;
  options: string[];
  defaultValue?: string;
  required?: boolean;
}
const SelectField: React.FC<SelectFieldProps> = ({
  id,
  info,
  label,
  labelClassName="text-sm",
  options,
  defaultValue,
  required = false,
}) => {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id as string} className={labelClassName}>
        {label}
      </Label>
      <select
        id={id as string}
        name={id as string}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="h-8 w-full font-bold px-2 "
      >
        <option value="">{info}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
