import React from 'react';
import Icon from './Icon';

const cardClassName = "glass-card p-3 rounded-3xl";

interface CustomPoseInputProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
}

const CustomPoseInput: React.FC<CustomPoseInputProps> = ({ prompt, onPromptChange }) => (
    <div className={`${cardClassName} animate-fade-in-up`}>
        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
            <Icon icon="edit" className="w-5 h-5 mr-2 text-violet-400" />
            Describe the Pose
        </h3>
        <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="e.g., leaning against a brick wall..."
            className="w-full h-16 p-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-200 placeholder:text-slate-500"
        />
    </div>
);

export default CustomPoseInput;