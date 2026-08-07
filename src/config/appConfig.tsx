import React from "react";
import { Gamepad2 } from "lucide-react";

export interface AppConfig {
  /**
   * Primary app title displayed across Navbar, Footer, and Header (English)
   */
  appName: string;

  /**
   * Primary app title in Arabic (Optional)
   */
  appNameAr?: string;

  /**
   * Subtitle or tagline (e.g., Gaming & Coffee Net)
   */
  appSubtitle: string;

  /**
   * Subtitle or tagline in Arabic (Optional)
   */
  appSubtitleAr?: string;

  /**
   * Optional image URL for logo (e.g. "/client-logo.png" or "https://example.com/logo.png")
   * If left empty or undefined, default Icon component will be rendered.
   */
  logoUrl?: string;

  /**
   * Default React Icon component to render when logoUrl is not provided
   */
  logoIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

  /**
   * Copyright footer text
   */
  copyrightText: string;

  /**
   * Copyright footer text in Arabic (Optional)
   */
  copyrightTextAr?: string;
}

/**
 * ============================================================================
 * CLIENT BRANDING CONFIGURATION
 * ============================================================================
 * Change the values below to easily customize the application logo & name
 * for different clients/venues.
 */
export const appConfig: AppConfig = {
  appName: "Playstation",
  appNameAr: "بلايستيشن هب",
  appSubtitle: "Gaming & Coffee Net",
  appSubtitleAr: "مركز ألعاب بلايستيشن وكافيه",
  logoUrl: "", // e.g. "/logo.png" if using custom logo image
  logoIcon: Gamepad2,
  copyrightText: "PlayStation Hub & Coffee Net System",
  copyrightTextAr: "نظام إدارة صالة البلايستيشن والكافيه",
};

/**
 * Helper component to render either custom logo image (if logoUrl is set) or icon logo
 */
export const AppLogo: React.FC<{ className?: string; iconClassName?: string; style?: React.CSSProperties }> = ({
  className = "w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 border border-emerald-400/40 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 overflow-hidden",
  iconClassName = "w-6 h-6 text-white",
  style,
}) => {
  if (appConfig.logoUrl) {
    return (
      <img
        src={appConfig.logoUrl}
        alt={appConfig.appName}
        className={`${className} object-contain`}
        style={style}
      />
    );
  }

  const IconComponent = appConfig.logoIcon;
  return (
    <div className={className} style={style}>
      <IconComponent className={iconClassName} />
    </div>
  );
};
