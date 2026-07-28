import React from "react";
export function Card({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}
export function CardHeader({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`border-b border-white/10 ${className}`}>{children}</div>
  );
}
export function CardTitle({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <h3 className={`text-xl font-bold text-white ${className}`}>{children}</h3>
  );
}
export function CardDescription({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <p className={`text-slate-300 text-sm ${className}`}>{children}</p>;
}
export function CardContent({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
