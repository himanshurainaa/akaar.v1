import React from 'react';
import Loader from './Loader';
import Icon from './Icon';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  onDownload: () => void;
  onEnhance: () => void;
  onShare: () => void;
  loadingMessage: string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, generatedImage, onDownload, onEnhance, onShare, loadingMessage, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="relative w-full h-full min-h-[400px] aspect-[4/5] glass-card rounded-3xl flex items-center justify-center p-2 overflow-hidden">
      {/* Base content: Image or Placeholder */}
      {generatedImage ? (
        <img
          src={generatedImage}
          alt="Virtual Try-On Result"
          className={`object-contain h-full w-full rounded-2xl transition-all duration-500 ${isLoading ? 'opacity-30 blur-md' : 'opacity-100 blur-0'}`}
        />
      ) : (
        !isLoading && !error && (
          <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full p-4">
            <div className="relative mb-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse-slow"></div>
                <Icon icon="sparkle" className="relative w-16 h-16 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Your New Look Awaits</h3>
            <p className="mt-2 max-w-xs text-slate-400">Upload your photo and an outfit to see the magic happen here.</p>
          </div>
        )
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-scale rounded-3xl">
          <Loader message={loadingMessage} />
        </div>
      )}

      {/* Error Overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 rounded-3xl">
          <div className="text-center text-red-400 px-4 animate-fade-in-scale">
            <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Undo/Redo Controls (Integrated) */}
      {generatedImage && !isLoading && (
          <div className="absolute top-4 right-4 flex items-center gap-2 animate-fade-in-up">
              <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-2.5 bg-black/50 backdrop-blur-lg text-slate-200 rounded-full border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-white/20 hover:enabled:border-white/20 transition-all active:scale-95"
                  aria-label="Undo last action"
                  title="Undo"
              >
                  <Icon icon="undo" className="w-5 h-5" />
              </button>
              <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-2.5 bg-black/50 backdrop-blur-lg text-slate-200 rounded-full border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-white/20 hover:enabled:border-white/20 transition-all active:scale-95"
                  aria-label="Redo last action"
                  title="Redo"
              >
                  <Icon icon="redo" className="w-5 h-5" />
              </button>
          </div>
      )}

      {/* Action Buttons */}
      {!isLoading && generatedImage && (
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 animate-fade-in-up">
            <button
                onClick={onEnhance}
                className="bg-white/10 backdrop-blur-lg text-slate-100 font-bold py-3 px-5 rounded-full border border-white/20 hover:border-violet-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                aria-label="Enhance image quality"
            >
                <Icon icon="sparkle" className="w-5 h-5 text-violet-400"/>
                <span>Enhance</span>
            </button>
            
            <button
              onClick={onDownload}
              className="bg-white/10 backdrop-blur-lg text-slate-100 font-bold py-3 px-5 rounded-full border border-white/20 hover:border-violet-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              aria-label="Download image"
            >
              <Icon icon="download" className="w-5 h-5 text-violet-400"/>
              <span>Download</span>
            </button>
            
            {navigator.share && (
              <button
                  onClick={onShare}
                  className="bg-white/10 backdrop-blur-lg text-slate-100 p-3.5 rounded-full border border-white/20 hover:border-violet-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  aria-label="Share image"
              >
                  <Icon icon="share" className="w-5 h-5"/>
              </button>
            )}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;