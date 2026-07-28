import React from "react";
import Input from "./Input";
import Label from "./Label";
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  labelClassName?: string;
  info?: string;
}
const Field: React.FC<FieldProps> = ({
  id,
  label,
  labelClassName,
  type = "text",
  defaultValue,
  value,
  required = false,
  placeholder,
  info,
  name,
  readOnly,
  className,
  ...props
}) => {
  return (
    <div className="grid gap-1">
      <Label className={labelClassName} htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        name={name || id}
        type={type}
        defaultValue={defaultValue}
        value={value}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder || info}
        className={`h-8 w-full font-bold ${className || ""}`}
        {...props}
      />
    </div>
  );
};

export default Field;
