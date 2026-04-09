import React from 'react';
import { ShieldAlert, Keyboard, PenTool } from 'lucide-react';

export default function LandingSection({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-slate-800/40 p-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-slate-700/50 max-w-3xl w-full">
        <div className="bg-slate-900/50 p-4 rounded-full inline-block mb-6 shadow-inner">
          <ShieldAlert className="w-16 h-16 text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 tracking-tight">
          Early Suicide Risk Detection
        </h1>
        <h2 className="text-xl text-indigo-200/80 font-medium mb-6">
          Multimodal Cognitive Analysis System
        </h2>
        <p className="text-slate-300 mb-10 leading-relaxed max-w-xl mx-auto">
          Choose a specific modality below. The AI parses cognitive behavior patterns 
          through either physical typing dynamics and text sentiment, or structural digital handwriting traits 
          to indicate early psychological risk factors.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-6">
          <button 
            onClick={() => onSelect('typing')}
            className="group relative flex flex-col items-center justify-center p-8 border border-slate-600 rounded-2xl bg-slate-800/50 transition-all duration-300 hover:bg-slate-700/50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:border-indigo-500"
          >
            <Keyboard className="w-10 h-10 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg text-slate-100">Typing & Sentiment</span>
            <span className="text-sm text-slate-400 mt-2">Analyze real-time typing behaviors and linguistic structure</span>
          </button>

          <button 
            onClick={() => onSelect('handwriting')}
            className="group relative flex flex-col items-center justify-center p-8 border border-slate-600 rounded-2xl bg-slate-800/50 transition-all duration-300 hover:bg-slate-700/50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-500"
          >
            <PenTool className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg text-slate-100">Handwriting Analysis</span>
            <span className="text-sm text-slate-400 mt-2">Analyze structural trace patterns from document uploads</span>
          </button>
        </div>
        
        <div className="mt-10 pt-6 border-t border-slate-700/50 text-xs text-slate-400/80">
          <p className="font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[10px]">Ethical Disclaimer</p>
          <p className="max-w-md mx-auto">This system is for research purposes only and is not a clinical diagnosis tool. If you or someone you know is in crisis, please seek immediate professional help.</p>
        </div>
      </div>
    </div>
  );
}
