import React, { useState, useEffect } from 'react';
import type { UploadedImage } from './types';
import { useHistoryState, HistoryState } from './hooks/useHistoryState';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import { generateVirtualTryOnImage, getStyleSuggestions, enhanceImageQuality } from './services/geminiService';
import Icon from './components/Icon';
import Footer from './components/Footer';
import PoseSelector from './components/PoseSelector';
import CustomPoseInput from './components/CustomPoseInput';
import FitSelector, { type FitOption } from './components/FitSelector';
import Documentation from './components/Documentation';
import Tooltip from './components/Tooltip';
import ResultDisplay from './components/ResultDisplay';
import WelcomeModal from './components/WelcomeModal';
import AdvancedEdits from './components/AdvancedEdits';

const cardClassName = "glass-card p-3 rounded-3xl";

const dataUrlToUploadedImage = async (dataUrl: string, fileName = "generated-image.png"): Promise<UploadedImage> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({
                file,
                previewUrl: result,
                base64,
                mimeType: file.type,
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


const App: React.FC = () => {
  // Input images
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [clothingImages, setClothingImages] = useState<UploadedImage[] | null>(null);

  // Generation options
  const [poseOption, setPoseOption] = useState<'original' | 'replicate' | 'custom'>('original');
  const [customPosePrompt, setCustomPosePrompt] = useState('');
  const [fitOption, setFitOption] = useState<FitOption>('regular');
  const [backgroundOption, setBackgroundOption] = useState<'custom' | 'outfit'>('custom');
  
  // State with Undo/Redo
  const { state, setState, undo, redo, canUndo, canRedo, resetState } = useHistoryState<HistoryState>({
    generatedImage: null,
    customPrompt: '',
    backgroundPrompt: '',
    baseImageForGeneration: null,
  });

  const { generatedImage, customPrompt, backgroundPrompt, baseImageForGeneration } = state;

  const setCustomPrompt = (prompt: string) => setState({ ...state, customPrompt: prompt });
  const setBackgroundPrompt = (prompt: string) => {
    setState({ ...state, backgroundPrompt: prompt });
  };
  
  // Other UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState<boolean>(false);
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [isGenerateHovered, setIsGenerateHovered] = useState(false);

  useEffect(() => {
    const welcomeDismissed = sessionStorage.getItem('welcomeModalDismissed');
    if (!welcomeDismissed) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    sessionStorage.setItem('welcomeModalDismissed', 'true');
    setShowWelcomeModal(false);
  };


  const isRefinement = !!generatedImage;
  const hasClothing = clothingImages && clothingImages.length > 0;
  
  const canTryOn = baseImageForGeneration && !isLoading && (
    isRefinement
      ? true
      : (hasClothing || customPrompt.trim() !== '' || backgroundPrompt.trim() !== '' || (poseOption === 'custom' && customPosePrompt.trim() !== ''))
  );

  const getButtonText = () => {
    if (isLoading) return 'Generating...';
    if (!personImage) return 'Upload Your Photo to Start';
    if (!hasClothing && customPrompt.trim() === '' && !generatedImage && backgroundPrompt.trim() === '' && !(poseOption === 'custom' && customPosePrompt.trim() !== '')) return 'Add Clothing or Custom Changes';
    if (generatedImage) return "Generate Again";
    return 'Try It On!';
  };
  
  const getDisabledReason = () => {
    if (isLoading || canTryOn) return null; // Not disabled or not for a user-action reason
    if (!baseImageForGeneration) {
      return 'Upload your photo to get started.';
    }
    if (!isRefinement && !hasClothing && customPrompt.trim() === '' && backgroundPrompt.trim() === '' && !(poseOption === 'custom' && customPosePrompt.trim() !== '')) {
      return 'Add an outfit or describe a change to make.';
    }
    return 'Ready when you are!';
  };

  const handleStartOver = () => {
    setPersonImage(null);
    setClothingImages(null);
    setPoseOption('original');
    setCustomPosePrompt('');
    setFitOption('regular');
    setBackgroundOption('custom');
    resetState({
        generatedImage: null,
        customPrompt: '',
        backgroundPrompt: '',
        baseImageForGeneration: null,
    });
    setError(null);
    setSuggestions([]);
  }

  const handleResetGenerationState = () => {
      resetState({
          ...state,
          generatedImage: null,
          customPrompt: '',
          backgroundPrompt: '',
          baseImageForGeneration: personImage,
      });
      setError(null);
      setSuggestions([]);
      setBackgroundOption('custom');
  }


  const handleSetPersonImage = (images: UploadedImage[] | null) => {
    const newPersonImage = images ? images[0] : null;
    setPersonImage(newPersonImage);

    setClothingImages(null);
    setPoseOption('original');
    setCustomPosePrompt('');
    setFitOption('regular');
    setBackgroundOption('custom');
    setError(null);
    setSuggestions([]);

    resetState({
        generatedImage: null,
        customPrompt: '',
        backgroundPrompt: '',
        baseImageForGeneration: newPersonImage,
    });
  }
  
  const handleSetClothingImages = (newImages: UploadedImage[] | null) => {
    if (!newImages || newImages.length === 0) return;
    const allImages = [...(clothingImages || []), ...newImages];
    setClothingImages(allImages);
    handleResetGenerationState();
  };

  const handleRemoveClothingImage = (indexToRemove: number) => {
    const newImages = clothingImages?.filter((_, index) => index !== indexToRemove) || null;
    const finalImages = (newImages && newImages.length > 0) ? newImages : null;
    setClothingImages(finalImages);
    if (!finalImages) {
      setBackgroundOption('custom');
    }
    handleResetGenerationState();
  };
  
  const handleTryOn = async () => {
    if (!canTryOn || !baseImageForGeneration) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setIsGeneratingSuggestions(false);
    
    const isFirstGeneration = !generatedImage;
    const clothingForGeneration = isFirstGeneration ? clothingImages : null;


    try {
      const imageUrl = await generateVirtualTryOnImage(
        baseImageForGeneration, 
        clothingForGeneration,
        poseOption,
        customPosePrompt,
        fitOption,
        customPrompt,
        backgroundOption,
        backgroundPrompt,
        (message) => setLoadingMessage(message)
      );
      
      const newBaseImage = await dataUrlToUploadedImage(imageUrl);
      
      setState({
          generatedImage: imageUrl,
          baseImageForGeneration: newBaseImage,
          customPrompt: '',
          backgroundPrompt: '',
      });

      if (isFirstGeneration && hasClothing) {
        setIsGeneratingSuggestions(true);
        const newSuggestions = await getStyleSuggestions(baseImageForGeneration, clothingImages);
        setSuggestions(newSuggestions);
      }
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setIsGeneratingSuggestions(false);
      setLoadingMessage('');
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const extension = generatedImage.substring(generatedImage.indexOf('/') + 1, generatedImage.indexOf(';'));
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ΛkaaR-try-on.${extension || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEnhanceImage = async () => {
    if (!generatedImage || isLoading) return;

    setIsLoading(true);
    setError(null);
    
    try {
        const imageToEnhance = await dataUrlToUploadedImage(generatedImage, 'image-to-enhance.png');
        const enhancedImageUrl = await enhanceImageQuality(
            imageToEnhance,
            (message) => setLoadingMessage(message)
        );
        
        const newBaseImage = await dataUrlToUploadedImage(enhancedImageUrl);
        setState({
            ...state,
            generatedImage: enhancedImageUrl,
            baseImageForGeneration: newBaseImage,
        });

    } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError("An unexpected error occurred during enhancement.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleShare = async () => {
    if (!generatedImage || !navigator.share) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], 'ΛkaaR-virtual-try-on.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'ΛkaaR Virtual Try-On',
          text: 'Check out my new look created with ΛkaaR!',
          files: [file],
        });
      } else {
        await navigator.share({
          title: 'ΛkaaR Virtual Try-On',
          text: 'Check out my new look created with ΛkaaR!',
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Share dialog was cancelled.');
      } else {
        console.error('Error sharing image:', error);
        setError("Could not share the image. Your browser may not support this feature.");
      }
    }
  };

  return (
    <>
      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in-up">
            {/* Left Column: Controls */}
            <div className="flex flex-col gap-3 w-full max-w-xl mx-auto lg:max-w-none">
              <div className={`${cardClassName}`}>
                  <div className="grid grid-cols-2 gap-3">
                      <ImageUploader
                          title="Your Photo"
                          icon="person"
                          onImageUpload={handleSetPersonImage}
                          imagePreviewUrl={personImage?.previewUrl || null}
                      />
                      {(!clothingImages || clothingImages.length === 0) ? (
                            <ImageUploader
                                title="The Outfit"
                                icon="outfit"
                                onImageUpload={handleSetClothingImages}
                                imagePreviewUrl={null}
                                allowMultiple={true}
                            />
                        ) : (
                            <div className="w-full h-full">
                                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                                    <Icon icon="outfit" className="w-5 h-5 mr-2 text-violet-400" />
                                    The Outfit
                                </h3>
                                <div className="grid grid-cols-2 gap-2 aspect-square w-full bg-white/5 border border-dashed rounded-xl p-2 border-white/10">
                                    {clothingImages.map((image, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img src={image.previewUrl} alt={`Clothing item ${index + 1}`} className="object-cover w-full h-full rounded-lg" />
                                            <button
                                                onClick={() => handleRemoveClothingImage(index)}
                                                className="absolute top-1 right-1 z-10 p-1 bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
                                                aria-label={`Remove item ${index + 1}`}
                                            >
                                                <Icon icon="close" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {clothingImages.length < 4 && (
                                        <ImageUploader
                                            title=""
                                            icon="plus"
                                            onImageUpload={handleSetClothingImages}
                                            imagePreviewUrl={null}
                                            allowMultiple={true}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                  </div>
              </div>

              <PoseSelector poseOption={poseOption} onPoseChange={setPoseOption} isRefinement={isRefinement}/>
              
              {poseOption === 'custom' && (
                  <CustomPoseInput prompt={customPosePrompt} onPromptChange={setCustomPosePrompt} />
              )}
            
              <FitSelector fitOption={fitOption} onFitChange={setFitOption} />
              
              <AdvancedEdits
                  customPrompt={customPrompt}
                  onPromptChange={setCustomPrompt}
                  suggestions={suggestions}
                  isGeneratingSuggestions={isGeneratingSuggestions}
                  onSuggestionClick={(suggestion) => setCustomPrompt(isRefinement ? suggestion : `${customPrompt} ${suggestion}`.trim())}
                  backgroundPrompt={backgroundPrompt}
                  onBackgroundPromptChange={setBackgroundPrompt}
                  backgroundOption={backgroundOption}
                  onBackgroundOptionChange={setBackgroundOption}
                  isOutfitUploaded={hasClothing}
                  isRefinement={isRefinement}
              />

              <div className="flex items-center gap-4 mt-1">
                  {isRefinement && (
                      <button onClick={handleStartOver} className={`flex items-center justify-center gap-2 w-auto py-3 px-5 border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200 font-bold rounded-xl text-base hover:border-slate-600 hover:from-slate-700 transition-all duration-300 active:scale-95 transform ${isLoading || isGenerateHovered ? 'scale-90 opacity-70' : 'hover:scale-105'} ${isLoading ? 'pointer-events-none' : ''}`} title="Start Over">
                          <Icon icon="reset" className="w-5 h-5"/>
                          <span>Start Over</span>
                      </button>
                  )}
                  <Tooltip message={getDisabledReason()} >
                    <button onMouseEnter={() => setIsGenerateHovered(true)} onMouseLeave={() => setIsGenerateHovered(false)} onClick={handleTryOn} disabled={!canTryOn} className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] disabled:from-slate-800 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95">
                        {getButtonText()}
                    </button>
                  </Tooltip>
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="w-full sticky top-8 flex flex-col gap-4">
                <ResultDisplay
                    isLoading={isLoading}
                    error={error}
                    generatedImage={generatedImage}
                    onDownload={handleDownload}
                    onEnhance={handleEnhanceImage}
                    onShare={handleShare}
                    loadingMessage={loadingMessage}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            </div>

          </div>
          <Footer onShowDocs={() => setShowDocs(true)} />
        </div>
      </main>

      {showDocs && <Documentation onClose={() => setShowDocs(false)} />}
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
    </>
  );
};

export default App;