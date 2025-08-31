import React from 'react';
import Icon from './Icon';

const cardClassName = "glass-card p-3 rounded-3xl";

interface PoseSelectorProps {
  poseOption: 'original' | 'replicate' | 'custom';
  onPoseChange: (pose: 'original' | 'replicate' | 'custom') => void;
  isRefinement: boolean;
}

const PoseSelector: React.FC<PoseSelectorProps> = ({ poseOption, onPoseChange, isRefinement }) => {
  const options = [
    { id: 'original' as const, label: 'Keep Original', icon: 'lock-closed' as const, disabled: false },
    { id: 'replicate' as const, label: 'Use Outfit Pose', icon: 'switch-horizontal' as const, disabled: isRefinement },
    { id: 'custom' as const, label: 'Custom', icon: 'edit' as const, disabled: false }
  ];

  return (
    <div className={cardClassName}>
      <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
        <Icon icon="person" className="w-5 h-5 mr-2 text-violet-400" />
        Choose Pose
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ id, label, icon, disabled }) => {
          const isActive = poseOption === id;
          return (
            <button
              key={id}
              onClick={() => onPoseChange(id)}
              disabled={disabled}
              title={disabled ? "This option is only available for the first generation." : ""}
              className={`p-3 text-sm font-semibold rounded-lg border transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-white/10 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon icon={icon} className={`w-5 h-5 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PoseSelector;