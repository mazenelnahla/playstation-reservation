import Label from "./Label";
import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: React.ReactNode;
  labelClassName?: string;
  dirName?: React.ReactNode;
};

export default function Textarea(props: TextareaProps) {
  const { className, label, labelClassName, dirName, ...rest } = props;

  const labelContent = label ?? dirName;

  return (
    <div className="grid gap-1">
      {labelContent ? (
        <Label className={`${labelClassName} pt-2`}>{labelContent}</Label>
      ) : null}
      <textarea
        className={`bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 px-4 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all resize-none ${className}`}
        {...rest}
      />
    </div>
  );
}
