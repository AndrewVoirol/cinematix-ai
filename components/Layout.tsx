
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass sticky top-0 z-50 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-camera-retro text-white"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            CINEMATIX AI
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-medium px-2 py-1 rounded-full border border-slate-800">
            v2.5 Flash / v3 Pro
          </span>
          <div className="h-6 w-[1px] bg-slate-800"></div>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Billing Docs
          </a>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      <footer className="glass border-t border-slate-800 px-6 py-3 text-center text-[10px] text-slate-500 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Cinematix AI Engine &bull; Powered by Google Gemini
      </footer>
    </div>
  );
};
