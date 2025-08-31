import React, { useCallback, useRef, useState } from 'react';
import type { UploadedImage } from '../types';
import Icon from './Icon';

interface ImageUploaderProps {
  title: string;
  // FIX: Added 'plus' to the allowed icon types to support its use in App.tsx for adding more clothing items.
  icon: 'person' | 'outfit' | 'bottoms' | 'shoes' | 'plus';
  onImageUpload: (images: UploadedImage[] | null) => void;
  imagePreviewUrl: string | null;
  allowMultiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, icon, onImageUpload, imagePreviewUrl, allowMultiple = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      onImageUpload(null);
      return;
    }

    setUploadState('loading');
    setError(null);
    setProgress(0);

    const filePromises = Array.from(files).map(file => {
      return new Promise<UploadedImage>((resolve, reject) => {
        const reader = new FileReader();

        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentLoaded = Math.round((event.loaded / event.total) * 100);
            setProgress(percentLoaded);
          }
        };

        reader.onloadend = () => {
          const result = reader.result as string;
          if (!result) {
            reject(new Error("File could not be read."));
            return;
          }
          const base64 = result.split(',')[1];
          resolve({
            file,
            previewUrl: result,
            base64,
            mimeType: file.type,
          });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then(uploadedImages => {
        onImageUpload(uploadedImages);
        setUploadState('idle');
      })
      .catch(error => {
        console.error("Error reading files:", error);
        setError("Failed to load image. Please try another file.");
        setUploadState('error');
        onImageUpload(null);
      });
  };

  const handleClick = () => {
    setUploadState('idle');
    setError(null);
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpload(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setUploadState('idle');
    setError(null);
  }
  
  const isAddButton = !title;

  return (
    <div className="w-full h-full">
      {title && (
         <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
            <Icon icon={icon} className="w-5 h-5 mr-2 text-violet-400" />
            {title}
        </h3>
      )}
      <div
        className={`relative group w-full aspect-square bg-white/5 border border-dashed rounded-xl flex items-center justify-center text-center p-1 cursor-pointer transition-all duration-300 ${isAddButton ? 'border-white/20 hover:border-violet-500 hover:bg-white/10 active:scale-95' : 'border-white/10 hover:border-violet-500'}`}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          multiple={allowMultiple}
        />
        {imagePreviewUrl ? (
          <>
            <img src={imagePreviewUrl} alt="Preview" className="object-contain h-full w-full rounded-lg animate-fade-in-scale" />
            <button 
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
              aria-label="Remove image"
            >
              <Icon icon="close" className="w-4 h-4" />
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" aria-hidden="true" />
          </>
        ) : isAddButton ? (
            <div className="text-slate-500 group-hover:text-violet-400 transition-colors">
                 <Icon icon="plus" className="w-8 h-8"/>
            </div>
        ): (
          <div className="text-slate-500 group-hover:text-slate-300 pointer-events-none transition-colors duration-300">
            <Icon icon="upload" className="w-10 h-10 mx-auto mb-2"/>
            <p className="font-semibold">{allowMultiple ? 'Click to add files' : 'Click to upload'}</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
        
        {/* Overlays for Loading and Error States */}
        {(uploadState === 'loading' || uploadState === 'error') && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 text-center z-20 animate-fade-in-scale">
                {uploadState === 'loading' && (
                <>
                    <p className="font-semibold text-slate-300 mb-4">Uploading...</p>
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                        <div 
                            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm font-mono text-slate-400 mt-2">{progress}%</p>
                </>
                )}
                {uploadState === 'error' && error && (
                <>
                    <Icon icon="warning" className="w-12 h-12 text-red-400 mb-3" />
                    <p className="font-semibold text-red-400 mb-4">{error}</p>
                    <button
                        onClick={handleClick}
                        className="px-4 py-2 bg-slate-700 text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-600 active:scale-95 transition-colors"
                    >
                        Try Again
                    </button>
                </>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;