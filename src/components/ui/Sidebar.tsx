import { cn } from "../../lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

interface SidebarProps {
  children?: ReactNode;
  className?: string;
  isOpen?: boolean;
}

export function Sidebar({ children, className, isOpen = true }: SidebarProps) {
  const { isRtl } = useLanguage();
  const hiddenX = isRtl ? "100%" : "-100%";

  return (
    <motion.aside
      initial={{ x: hiddenX }}
      animate={{ x: isOpen ? "0%" : hiddenX }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 h-screen w-64 bg-[#1F2020] text-slate-50 shadow-xl flex flex-col z-40",
        isRtl ? "right-0 border-l" : "left-0 border-r",
        className,
      )}
    >
      {children}
    </motion.aside>
  );
}

export function SidebarContent({ children, className }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-grow justify-between gap-2 p-4 pt-2 overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className }: SidebarProps) {
  return (
    <div
      className={cn(
        "border-b border-gray-600 p-4 text-lg font-semibold text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
