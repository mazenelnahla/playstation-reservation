
import React, { useEffect } from 'react'
type Props = { open: boolean, onOpenChange: (open:boolean)=>void, children: React.ReactNode, className?: string }
export function Dialog({ open, onOpenChange, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent){ if (e.key === 'Escape') onOpenChange(false) }
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey)
  }, [onOpenChange])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-slate-900 light:bg-white shadow-2xl border border-white/20 light:border-slate-300 p-6 text-slate-100 light:text-slate-900">{children}</div>
    </div>
  )
}
export function DialogHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`.trim()}>{children}</div>
}
export function DialogTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-xl font-bold text-white light:text-slate-900 ${className}`.trim()}>{children}</h2>
}
export function DialogDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-slate-400 light:text-slate-600 mt-1 ${className}`.trim()}>{children}</p>
}
export default Dialog
