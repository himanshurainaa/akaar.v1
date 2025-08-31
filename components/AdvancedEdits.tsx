import React, { useState } from 'react';
import Icon from './Icon';
import SuggestionBox from './SuggestionBox';

// This combines the props from both old components
interface AdvancedEditsProps {
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  suggestions: string[];
  isGeneratingSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  backgroundPrompt: string;
  onBackgroundPromptChange: (prompt: string) => void;
  backgroundOption: 'custom' | 'outfit';
  onBackgroundOptionChange: (option: 'custom' | 'outfit') => void;
  isOutfitUploaded: boolean;
  isRefinement: boolean;
}

const surprisePrompts = [
    'Give me a cool new hairstyle', 'Add stylish sunglasses', 'Change the background to a futuristic cityscape',
    'Put a friendly robot in the background', 'Make my t-shirt a vintage band shirt', 'Add a leather jacket',
    'Change the lighting to a golden hour sunset', 'Add a subtle, magical glow around me',
    'Put a cute cat on my shoulder', 'Wear a classic fedora hat', 'Change my shirt to a Hawaiian shirt',
    'Add a simple gold necklace',
];

const backgroundSuggestions = [
    'a clean, white studio background', 'a bustling city street at night with neon lights', 'a serene beach at sunset',
    'a cozy, rustic coffee shop interior', 'the top of a mountain with a beautiful view', 'a futuristic cityscape',
];

const AdvancedEdits: React.FC<AdvancedEditsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'custom' | 'background'>('custom');

    const handleSurpriseMe = () => {
        const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
        props.onPromptChange(randomPrompt);
        setActiveTab('custom');
    };
    
    const handleBgSuggestionClick = (suggestion: string) => {
        props.onBackgroundOptionChange('custom');
        props.onBackgroundPromptChange(suggestion);
        setActiveTab('background');
    };

    const handleUseOutfitBg = () => {
        props.onBackgroundOptionChange('outfit');
        props.onBackgroundPromptChange('');
        setActiveTab('background');
    }

    return (
        <div className="glass-card p-3 rounded-3xl animate-fade-in-up">
            {/* Tabs */}
            <div className="flex justify-between items-center mb-2">
                 <div className="flex bg-black/20 p-1 rounded-full border border-white/10">
                    <button onClick={() => setActiveTab('custom')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeTab === 'custom' ? 'bg-white/10 text-violet-300' : 'text-slate-400 hover:text-white'}`}>
                        Custom Changes
                    </button>
                    <button onClick={() => setActiveTab('background')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeTab === 'background' ? 'bg-white/10 text-violet-300' : 'text-slate-400 hover:text-white'}`}>
                        Background
                    </button>
                </div>
                <button
                  onClick={handleSurpriseMe}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 hover:text-violet-400 transition-all duration-200 transform active:scale-95"
                  title="Surprise Me!"
                  aria-label="Generate a random custom change prompt"
                >
                  <Icon icon="sparkle" className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="mt-2">
                {activeTab === 'custom' && (
                    <div className="animate-fade-in-scale">
                        <textarea
                            value={props.customPrompt}
                            onChange={(e) => props.onPromptChange(e.target.value)}
                            placeholder="e.g., change hairstyle, add a hat..."
                            className="w-full h-24 p-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-200 placeholder:text-slate-500"
                        />
                        <SuggestionBox
                            suggestions={props.suggestions}
                            isLoading={props.isGeneratingSuggestions}
                            onSuggestionClick={props.onSuggestionClick}
                        />
                    </div>
                )}

                {activeTab === 'background' && (
                    <div className="animate-fade-in-scale">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <button
                                onClick={() => props.onBackgroundOptionChange('custom')}
                                className={`p-3 text-sm font-semibold rounded-lg border transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${props.backgroundOption === 'custom' ? 'bg-white/10 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}
                            >
                                <Icon icon="edit" className={`w-5 h-5 transition-colors ${props.backgroundOption === 'custom' ? 'text-violet-400' : 'text-slate-400'}`} />
                                <span>Custom</span>
                            </button>
                            <button
                                onClick={handleUseOutfitBg}
                                disabled={!props.isOutfitUploaded || props.isRefinement}
                                title={props.isRefinement ? "This option is only available for the first generation." : ""}
                                className={`p-3 text-sm font-semibold rounded-lg border transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${props.backgroundOption === 'outfit' ? 'bg-white/10 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}
                            >
                                <Icon icon="clone" className={`w-5 h-5 transition-colors ${props.backgroundOption === 'outfit' ? 'text-violet-400' : 'text-slate-400'}`} />
                                <span>Use Outfit BG</span>
                            </button>
                        </div>
                        <textarea
                            value={props.backgroundPrompt}
                            onChange={(e) => {
                                props.onBackgroundOptionChange('custom');
                                props.onBackgroundPromptChange(e.target.value);
                            }}
                            placeholder="e.g., a beach at sunset, a studio..."
                            className={`w-full h-24 p-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-200 placeholder:text-slate-500 ${props.backgroundOption !== 'custom' && 'opacity-50'}`}
                            disabled={props.backgroundOption !== 'custom'}
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {backgroundSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleBgSuggestionClick(suggestion)}
                                className="px-3 py-1 bg-white/5 text-slate-300 text-sm rounded-full border border-white/10 hover:bg-violet-600/50 hover:border-violet-500 hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
                            >
                                {suggestion}
                            </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedEdits;