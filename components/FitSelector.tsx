import React from 'react';
import Icon from './Icon';

const cardClassName = "glass-card p-3 rounded-3xl";

export type FitOption = 'slim' | 'regular' | 'loose' | 'baggy' | 'oversized';

interface FitSelectorProps {
  fitOption: FitOption;
  onFitChange: (fit: FitOption) => void;
}

const fitOptions: { id: FitOption; label: string; description: string; icon: 'fit-slim' | 'fit-regular' | 'fit-loose' | 'fit-baggy' | 'fit-oversized'; }[] = [
  { id: 'slim', label: 'Slim', description: "Hugs the body's contours", icon: 'fit-slim' },
  { id: 'regular', label: 'Regular', description: 'A classic, standard fit', icon: 'fit-regular' },
  { id: 'loose', label: 'Loose', description: 'A relaxed, comfortable drape', icon: 'fit-loose' },
  { id: 'baggy', label: 'Baggy', description: 'Roomy and casual streetwear', icon: 'fit-baggy' },
  { id: 'oversized', label: 'Oversized', description: 'An intentional, fashion fit', icon: 'fit-oversized' },
];

const FitSelector: React.FC<FitSelectorProps> = ({ fitOption, onFitChange }) => {
  return (
    <div className={cardClassName}>
      <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
        <Icon icon="outfit" className="w-5 h-5 mr-2 text-violet-400" />
        Select Fit
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {fitOptions.map(({ id, label, description, icon }) => (
          <button
            key={id}
            onClick={() => onFitChange(id)}
            title={description}
            className={`p-2 text-center rounded-xl border transition-all duration-300 active:scale-95 flex flex-col items-center justify-start gap-1.5 ${
              fitOption === id
                ? 'bg-white/10 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <Icon icon={icon} className="w-6 h-6" />
            <span className="font-semibold text-sm leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FitSelector;