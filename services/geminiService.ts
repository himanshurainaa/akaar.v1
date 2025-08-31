import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { UploadedImage } from '../types';

const handleApiError = (error: any, context: string): Error => {
    console.error(`Error in ${context}:`, error);

    // Handle structured Gemini API errors
    if (typeof error === 'object' && error !== null && error.error) {
        const apiError = error.error;
        if (apiError.code === 429 || apiError.status === 'RESOURCE_EXHAUSTED') {
            return new Error("Request limit reached. Please wait a minute and try again. For higher usage, please check your plan and billing details.");
        }
        if (apiError.message) {
            return new Error(`API Error: ${apiError.message}`);
        }
    }

    // Handle standard Error objects, including those with JSON in the message
    if (error instanceof Error) {
        try {
            // Some errors might still have JSON in the message property
            if (error.message && error.message.trim().startsWith('{')) {
                const apiError = JSON.parse(error.message);
                if (apiError.error?.code === 429 || apiError.error?.status === 'RESOURCE_EXHAUSTED') {
                    return new Error("Request limit reached. Please wait a minute and try again. For higher usage, please check your plan and billing details.");
                }
                if (apiError.error?.message) {
                    return new Error(`API Error: ${apiError.error.message}`);
                }
            }
        } catch (e) {
            // Not a JSON error message, fall through.
        }
        
        if (error.message.includes('SAFETY')) {
            return new Error("The request was blocked by safety filters. Please try a different image or prompt.");
        }
        
        return new Error(`An error occurred: ${error.message}`);
    }

    return new Error(`An unknown error occurred during ${context}.`);
};

const getFitInstruction = (fitOption: string): string => {
    switch (fitOption) {
        case 'slim':
            return `Apply a SLIM fit transformation to the clothing, making it hug the SUBJECT's body contours.`;
        case 'regular':
            return `Apply a REGULAR, classic fit transformation to the clothing.`;
        case 'loose':
            return `Apply a LOOSE fit transformation to the clothing, giving it a relaxed drape.`;
        case 'baggy':
            return `Apply a BAGGY fit transformation to the clothing, making it appear very loose and roomy.`;
        case 'oversized':
            return `Apply an OVERSIZED fit transformation to the clothing, giving it an exaggerated, fashion-forward proportions.`;
        default:
            return `Apply a REGULAR, classic fit transformation to the clothing.`;
    }
};


export const generateVirtualTryOnImage = async (
    personImage: UploadedImage,
    clothingImages: UploadedImage[] | null,
    poseOption: 'original' | 'replicate' | 'custom',
    customPosePrompt: string,
    fitOption: string,
    customPrompt: string,
    backgroundOption: 'custom' | 'outfit',
    backgroundPrompt: string,
    onProgress: (message: string) => void
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const hasClothing = clothingImages && clothingImages.length > 0;
        const mainClothingReference = hasClothing ? clothingImages[0] : null;

        let progressMessage = "Generating your image...";
        if (hasClothing) {
            progressMessage = "Simulating your new outfit...";
        } else if ((backgroundPrompt.trim() !== '' || backgroundOption === 'outfit')) {
            progressMessage = "Compositing new background...";
        } else if (customPrompt.trim() !== '') {
            progressMessage = "Executing custom refinements...";
        }
        onProgress(progressMessage);

        let backgroundInstruction = 'Keep the original background from IMAGE_0.';
        if (backgroundOption === 'outfit' && mainClothingReference) {
            backgroundInstruction = `Replace the background with the background from IMAGE_1. You must perfectly composite the SUBJECT into this new background, matching lighting and perspective.`;
        } else if (backgroundPrompt.trim() !== '') {
            backgroundInstruction = `Replace the background with a new, photorealistic scene: "${backgroundPrompt}". Match the lighting on the SUBJECT to the new scene.`;
        }

        let poseInstruction = `Keep the original pose of the SUBJECT from IMAGE_0.`;
        if (poseOption === 'replicate' && mainClothingReference) {
            poseInstruction = `Make the SUBJECT adopt the pose seen in IMAGE_1.`;
        } else if (poseOption === 'custom' && customPosePrompt.trim()) {
            poseInstruction = `Make the SUBJECT adopt this pose: "${customPosePrompt}".`;
        }
        
        let clothingInstruction = `Do not change the clothing on the SUBJECT.`;
        if (hasClothing) {
            clothingInstruction = `Take all the clothes and accessories from IMAGE_1 and any subsequent images and photorealistically place them onto the SUBJECT.`;
        }
        
        let customChangesInstruction = `No other changes.`;
        if(customPrompt.trim()){
            customChangesInstruction = `Apply this final change: "${customPrompt.trim()}".`;
        }

        const finalPrompt = `
// **MISSION: PHOTO EDIT - VIRTUAL TRY-ON**

// **NON-NEGOTIABLE RULE #1: IDENTITY LOCK**
// - IMAGE_0 contains the SUBJECT. Their face, body, hair, and skin tone are the absolute source of truth.
// - You are STRICTLY FORBIDDEN from altering the SUBJECT's identity in any way.
// - All other images (IMAGE_1, IMAGE_2, etc.) contain CLOTHING ASSETS. The people in these images are MANNEQUINS.
// - You MUST completely ignore and discard the face, body, and identity of the MANNEQUINS. They do not exist.
// - The final output MUST contain the exact, unaltered person from IMAGE_0. This is the most important rule. Any other result is a failure.

// **TASK STEPS (IN ORDER):**
// 1.  **IDENTIFY SUBJECT:** Lock the person in IMAGE_0 as the unchangeable SUBJECT.
// 2.  **EXTRACT ASSETS:** From all other images (IMAGE_1+), extract ONLY the clothing and accessories. Ignore the MANNEQUINS.
// 3.  **APPLY POSE:** ${poseInstruction}
// 4.  **APPLY CLOTHING:** ${clothingInstruction}
// 5.  **APPLY FIT:** ${getFitInstruction(fitOption)}
// 6.  **APPLY BACKGROUND:** ${backgroundInstruction}
// 7.  **APPLY CUSTOM EDITS:** ${customChangesInstruction}
// 8.  **RENDER FINAL IMAGE:** Create the final image ensuring the SUBJECT from IMAGE_0 is the person in the photo.
`;

        const personImagePart = { inlineData: { mimeType: personImage.mimeType, data: personImage.base64 } };
        
        const clothingImageParts = (clothingImages || []).map(img => ({
            inlineData: { mimeType: img.mimeType, data: img.base64 }
        }));

        const promptPart = { text: finalPrompt };
        
        const allParts = [personImagePart, ...clothingImageParts, promptPart];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: allParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
                temperature: 0, // Set to 0 for maximum fidelity and adherence to strict rules.
            },
        });

        const candidate = response.candidates?.[0];

        if (!candidate) {
            throw new Error("The model did not return a response. This might be due to a network issue or an invalid request.");
        }

        if (candidate.finishReason === 'SAFETY') {
            throw new Error("The generated image was blocked by safety filters. Please try using a different photo, outfit, or custom prompt.");
        }
        
        const imagePart = candidate.content.parts.find(part => part.inlineData);
        
        if (imagePart?.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
            return imageUrl;
        }
        
        throw new Error("The API did not return an image. The response may have been empty, malformed, or blocked by content policies.");

    } catch (error) {
        throw handleApiError(error, "virtual try-on generation");
    }
};

export const getStyleSuggestions = async (
    personImage: UploadedImage,
    clothingImages: UploadedImage[] | null,
): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const prompt = `// [AI_PERSONA_INITIALIZATION]
// - ID: Stylos-X
// - DESIGNATION: Master Stylist & Fashion Editor AI
// - MISSION: Provide exceptionally chic, stylish, and specific accessory suggestions to elevate a user's virtual try-on look to haute couture level.

// [INPUT_ANALYSIS]
// 1.  **Subject Analysis (IMAGE_0):** Analyze the user's general aesthetic, presentation, and personal style cues.
// 2.  **Outfit Vector Analysis (IMAGE_1+):** Determine the stylistic vector of the outfit (e.g., minimalist, techwear, bohemian, formal). Analyze color palette, materials, and silhouette balance.

// [TASK_DIRECTIVE]
// - Generate 3-5 concise, highly specific, and actionable accessory suggestions based on principles of high-fashion styling.
// - Suggestions must be synergistic with the analyzed 'Outfit Vector' and elevate the final look.
// - Avoid generic advice (e.g., "add a necklace"). Be specific (e.g., "a delicate silver chain necklace with a small geometric pendant" or "a chunky gold curb chain for a statement look").
// - The output MUST be a valid JSON object with a single key "suggestions", which is an array of strings.
// - Example: {"suggestions": ["a minimalist silver chain", "classic black rectangular sunglasses for a sharp and architectural edge", "a vintage leather-strap watch with a clean, dark dial", "one or two minimalist silver rings for a subtle touch of personal style"]}.
// - Do not include any other text, preamble, or explanation. Your entire output must be only the JSON object.`;
        
        const personImagePart = { inlineData: { mimeType: personImage.mimeType, data: personImage.base64 } };
        
        const clothingImageParts = (clothingImages || []).map(img => ({
            inlineData: { mimeType: img.mimeType, data: img.base64 }
        }));

        const textPart = { text: prompt };

        const allParts = [personImagePart, ...clothingImageParts, textPart];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: allParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.suggestions)) {
            return result.suggestions;
        }

        return [];

    } catch (error) {
        console.error("Error generating style suggestions:", error);
        return [];
    }
};

export const enhanceImageQuality = async (
    image: UploadedImage,
    onProgress: (message: string) => void
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        onProgress("Applying photo enhancements...");

        const prompt = `
// **AI_PERSONA_INITIALIZATION**
// - **ID:** Lumina-Prime
// - **DESIGNATION:** Master Digital Image Finishing & Restoration Engine
// - **MISSION:** Execute a sophisticated, non-destructive, and photorealistic enhancement on the input image. The objective is to elevate its quality to that of a professional, high-end commercial photograph, suitable for print or digital display.

// **CORE_TASK: MULTI-STAGE ENHANCEMENT PIPELINE**

// **STAGE 1: ANALYSIS & PREPARATION**
// 1.  **NOISE_REDUCTION:** Analyze the image for digital noise (luminance and chrominance). Apply a subtle, intelligent noise reduction algorithm, preserving critical edge details and textures.
// 2.  **DYNAMIC_RANGE_OPTIMIZATION:** Analyze the histogram. Carefully recover detail in highlight and shadow areas, expanding the dynamic range without introducing artifacts or a flat, unnatural HDR look.

// **STAGE 2: COLOR & TONE CORRECTION**
// 3.  **TONE_MAPPING:** Apply a precise, non-linear S-curve to the global tone map to introduce rich, cinematic contrast. Blacks should be deep but not crushed; whites should be bright but not clipped.
// 4.  **COLOR_GRADING:** Perform a meticulous color balance correction to achieve a perfectly neutral white balance as a baseline. Then, subtly enhance color vibrancy and saturation for a more dynamic and appealing image, paying special attention to ensuring skin tones remain natural, accurate, and true-to-life.

// **STAGE 3: DETAIL & CLARITY ENHANCEMENT**
// 5.  **SHARPNESS_&_MICROCONTRAST:** Apply a multi-pass frequency separation technique. Selectively enhance micro-contrast to accentuate fine details in fabric textures, hair, and environmental elements. The application must be subtle, using a small radius to avoid creating edge halos, digital artifacts, or an over-sharpened appearance. The goal is clarity, not harshness.

// **IMMUTABLE_CONSTRAINTS: ABSOLUTE & NON-NEGOTIABLE**
// - **IDENTITY_IS_SACROSANCT:** You are STRICTLY FORBIDDEN from altering the subject's core identity. This includes facial features, expression, skin texture, age, or ethnicity. This is a photo quality enhancement, not a "beauty filter" or retouching.
// - **CONTENT_IS_LOCKED:** You MUST NOT change the outfit, its colors, its fit, or any accessories. The content of the image is fixed.
// - **COMPOSITION_IS_LOCKED:** The background, the subject's pose, and their position within the frame are UNALTERABLE.

// **FINAL_OUTPUT_SPECIFICATION**
// The final output must be a photographically superior version of the input image, maintaining 100% fidelity to the original content and identity. The enhancement should be subtle and feel as if the original photo was simply captured with a superior camera lens, a larger sensor, and under professional lighting conditions.
`;
        const imagePart = { inlineData: { mimeType: image.mimeType, data: image.base64 } };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
                temperature: 0,
            },
        });

        const candidate = response.candidates?.[0];

        if (!candidate) {
            throw new Error("The model did not return a response for enhancement.");
        }

        if (candidate.finishReason === 'SAFETY') {
            throw new Error("The enhancement was blocked by safety filters.");
        }
        
        const resultImagePart = candidate.content.parts.find(part => part.inlineData);
        
        if (resultImagePart?.inlineData) {
            const base64ImageBytes = resultImagePart.inlineData.data;
            const imageUrl = `data:${resultImagePart.inlineData.mimeType};base64,${resultImagePart.inlineData.data}`;
            return imageUrl;
        }
        
        throw new Error("The API did not return an enhanced image.");

    } catch (error) {
        throw handleApiError(error, "image enhancement");
    }
};