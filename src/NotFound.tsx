import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import Button from "./components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="primary"
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 justify-center"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
