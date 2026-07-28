
import React, { useEffect, useRef, useState } from 'react'
export function DropdownMenu({ children }: { children: React.ReactNode }) { return <div className="relative inline-block">{children}</div> }
export function DropdownMenuTrigger({ asChild=false, children, onClick }:{asChild?:boolean, children:any, onClick?:()=>void}) {
  const child = React.Children.only(children)
  const props = { onClick, className: (child.props.className||'') }
  return React.cloneElement(child, props)
}
export function DropdownMenuContent({ align='start', children }:{align?:'start'|'end', children:React.ReactNode}) {
  const [open, setOpen] = useState(true) // controlled externally by re-mounting
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    function onDoc(e: MouseEvent){ if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc)
  },[])
  if (!open) return null
  return <div ref={ref} className={"absolute mt-2 min-w-40 rounded-xl border border-slate-200 bg-white shadow-lg p-1 "+(align==='end'?'right-0':'left-0')}>{children}</div>
}
export function DropdownMenuItem({ onClick, children }:{ onClick?:()=>void, children:React.ReactNode }) {
  return <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm" onClick={onClick}>{children}</button>
}
