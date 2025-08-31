import React from 'react';
import Icon from './Icon';

interface FooterProps {
    onShowDocs: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowDocs }) => {
  return (
    <footer className="text-center py-8 mt-8 border-t border-white/10 animate-fade-in-up">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex flex-row items-center justify-center gap-3">
            <p className="text-sm font-bold text-gradient-ios text-glow">
                Developed By Himanshu
            </p>
            <a
                href="https://www.instagram.com/_himanshurainaa/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:opacity-80 transition-opacity duration-300"
                aria-label="Himanshu Raina's Instagram Profile"
            >
                <Icon icon="instagram" className="w-6 h-6" />
            </a>
            </div>
             <button
                onClick={onShowDocs}
                className="text-sm text-slate-400 font-semibold flex items-center gap-2 hover:text-violet-400 transition-colors"
            >
                <Icon icon="book-open" className="w-5 h-5"/>
                <span>Open Codex (Docs)</span>
            </button>
        </div>
        <div className="flex items-center gap-2 text-slate-500 max-w-md mx-auto pt-4 border-t border-white/5 w-full mt-4">
          <Icon icon="warning" className="w-5 h-5 flex-shrink-0 text-amber-500/80" />
          <p className="text-xs text-center font-ios">
            <strong>Disclaimer:</strong> This AI is in a developmental phase. Generated results may occasionally be inaccurate or unexpected. Your understanding is appreciated.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;