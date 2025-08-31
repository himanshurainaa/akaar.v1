import React from 'react';
import Icon from './Icon';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-scale">
      <div className="glass-card max-w-lg w-full rounded-3xl flex flex-col items-center text-center p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-all transform active:scale-95"
          aria-label="Close welcome message"
        >
          <Icon icon="close" className="w-5 h-5" />
        </button>
        
        <div className="relative mb-4">
            <div className="absolute -inset-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-25 animate-pulse-slow"></div>
            <h1 className="relative text-5xl sm:text-6xl font-black tracking-tighter text-glow text-gradient-ios">
              ΛkaaR
            </h1>
        </div>
        
        <div className="my-6 w-full flex items-center gap-3 text-slate-400 bg-black/20 p-4 rounded-xl border border-white/10">
          <Icon icon="warning" className="w-8 h-8 flex-shrink-0 text-amber-500/80" />
          <p className="text-sm text-left font-ios">
            <strong>Disclaimer:</strong> This AI is in a developmental phase. Generated results may occasionally be inaccurate or unexpected. Your understanding is appreciated.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full max-w-xs py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;