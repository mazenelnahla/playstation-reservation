import React from "react";
export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 px-4 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all ${className}`}
      {...rest}
    />
  );
}
