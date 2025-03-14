/**
 * SiliconFlow Kolors API Client
 * This module handles communication with the SiliconFlow Kolors API for portrait generation
 */

// API configuration
const KOLORS_API_ENDPOINT = 'https://api.siliconflow.cn/v1/images/generations';
const KOLORS_API_KEY = process.env.NEXT_PUBLIC_KOLORS_API_KEY || '';

// Types for Kolors API
export interface KolorsPortraitRequest {
  image: string; // Base64 encoded image
  scene: string; // Scene type
  parameters: {
    background: number; // 0-100
    lighting: number; // 0-100
    detail: number; // 0-100
    style?: string; // Optional style parameter
    resolution?: string; // Optional resolution parameter
  };
}

export interface KolorsPortraitResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  result?: {
    image: string; // Base64 encoded image
    metadata: {
      processingTime: number;
      size: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Convert dataURL to base64 string (removing the prefix)
 */
const dataURLToBase64 = (dataURL: string): string => {
  return dataURL.split(',')[1];
};

/**
 * Convert base64 to dataURL
 */
const base64ToDataURL = (base64: string, mimeType = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Map scene type to Kolors API scene type
 */
const mapSceneType = (scene: string): string => {
  switch (scene.toLowerCase()) {
    case 'professional':
      return 'professional portrait';
    case 'passport':
      return 'id photo';
    case 'business':
      return 'business portrait';
    case 'academic':
      return 'academic portrait';
    case 'social':
      return 'social media portrait';
    case 'wedding':
      return 'wedding portrait';
    case 'student':
      return 'student id photo';
    case 'virtual':
      return 'virtual meeting portrait';
    default:
      return 'professional portrait';
  }
};

/**
 * Generate portrait using SiliconFlow Kolors API
 */
export const generateKolorsPortrait = async (
  request: KolorsPortraitRequest,
  onProgress?: (percent: number) => void
): Promise<KolorsPortraitResponse> => {
  try {
    // Start progress at 0%
    if (onProgress) onProgress(0);

    // Create a prompt based on the scene and parameters
    const styleText = request.parameters.style ? `in ${request.parameters.style} style` : '';
    const backgroundQuality = request.parameters.background > 75 ? 'high-quality' : 
                             request.parameters.background > 50 ? 'medium-quality' : 'simple';
    const lightingQuality = request.parameters.lighting > 75 ? 'dramatic' : 
                           request.parameters.lighting > 50 ? 'professional' : 'soft';
    const detailLevel = request.parameters.detail > 75 ? 'highly detailed' : 
                       request.parameters.detail > 50 ? 'detailed' : 'smooth';
    
    // Get resolution from parameters or use default
    const resolution = request.parameters.resolution || '1024x1024';
    
    // Determine background type and color based on scene
    const getBackgroundType = (scene: string): string => {
      switch (scene.toLowerCase()) {
        case 'professional':
        case 'business':
          return 'gradient';
        case 'passport':
        case 'student':
          return 'solid';
        case 'academic':
          return 'textured';
        case 'social':
          return 'blurred';
        case 'wedding':
          return 'elegant';
        case 'virtual':
          return 'digital';
        default:
          return 'neutral';
      }
    };
    
    const getCorporateColor = (scene: string): string => {
      switch (scene.toLowerCase()) {
        case 'professional':
          return 'blue-gray';
        case 'business':
          return 'navy';
        case 'passport':
        case 'student':
          return 'white';
        case 'academic':
          return 'maroon';
        case 'social':
          return 'vibrant';
        case 'wedding':
          return 'cream';
        case 'virtual':
          return 'teal';
        default:
          return 'neutral';
      }
    };
    
    const getProfessionalAttire = (scene: string): string => {
      switch (scene.toLowerCase()) {
        case 'professional':
        case 'business':
          return 'formal business';
        case 'passport':
        case 'student':
          return 'neat casual';
        case 'academic':
          return 'academic';
        case 'social':
          return 'smart casual';
        case 'wedding':
          return 'formal';
        case 'virtual':
          return 'business casual';
        default:
          return 'professional';
      }
    };
    
    const backgroundType = getBackgroundType(request.scene);
    const corporateColor = getCorporateColor(request.scene);
    const professionalAttire = getProfessionalAttire(request.scene);

    // Prepare request body according to SiliconFlow API format
    const requestBody = {
      model: "Kwai-Kolors/Kolors",
      prompt: `Professional ${mapSceneType(request.scene)} headshot of a real person, 
strictly maintain original facial features and skin texture[3,5,7](@ref), 
${professionalAttire} attire in neutral colors[1,6](@ref), 
natural lighting and skin tone[4](@ref), 
${backgroundQuality} ${backgroundType} background in ${corporateColor} tones[2](@ref), 
${lightingQuality} lighting with ${detailLevel} features[3](@ref) ${styleText},
--enable_face_encoder=True --guidance_scale=7.5[3,6](@ref)`,
      negative_prompt: "blurry, distorted, low quality, deformed face, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limbs, ugly, poorly drawn hands, missing limbs, floating limbs, out of frame, watermark, signature, text, (deformed, distorted, disfigured:1.3), (poorly drawn face:1.2), (mutation, mutated, extra limbs:1.4), (bad proportions, unnatural body:1.3), (text, watermark, signature:1.5), (cartoon, anime, 3d, doll:1.3), (blurry, pixelated, low resolution:1.2), (ugly teeth, unnatural eyes:1.4), (strange lighting, overexposed:1.3), (improper attire, casual clothing:1.4), (nudity, NSFW:1.7), (artificial, fake looking:1.4), (oversaturated colors:1.3), (unnatural skin texture:1.4), (plastic looking:1.3), (overprocessed:1.4)",
      image_size: resolution,
      batch_size: 1,
      seed: Math.floor(Math.random() * 9999999999),
      num_inference_steps: 30,
      guidance_scale: 7.5,
      image: `data:image/jpeg;base64,${request.image}`,
      enable_face_encoder: true,
      ip_adapter: "faceid_plus",
      scheduler: "DPM++ 2M Karras",
      clip_skip: 2,
      vae: "stabilityai/sd-vae-ft-mse",
      lora_weights: "0.7",
      lora_scale: "0.7",
      high_res_fix: "True",
      high_res_fix_scale: "1.5",
      high_res_fix_steps: 20,
      high_res_fix_denoising_strength: "0.7"
    };

    console.log("Sending request to SiliconFlow API:", JSON.stringify(requestBody, null, 2));

    // Make API request
    const response = await fetch(KOLORS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOLORS_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // Update progress to 50%
    if (onProgress) onProgress(50);

    // Check if response is OK
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (parseError) {
        // If we can't parse the error as JSON, try to get the text
        try {
          const errorText = await response.text();
          errorMessage = `API error: ${errorText}`;
        } catch (textError) {
          // If we can't get the text either, use the status
          console.error("Failed to parse error response:", textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    // Safely parse the response
    let responseData;
    try {
      const responseText = await response.text();
      console.log("Raw API response:", responseText.substring(0, 200) + "...");
      
      // Try to parse as JSON
      responseData = JSON.parse(responseText);
      
      // Log the response for debugging
      console.log("Parsed API response:", JSON.stringify(responseData, null, 2));
      
      // Check if we have images in the response
      if (!responseData.images || !responseData.images.length) {
        throw new Error("No images returned in the API response");
      }
      
      // Get the image URL from the response
      const imageUrl = responseData.images[0].url;
      
      if (!imageUrl) {
        throw new Error("No image URL in the API response");
      }
      
      // Fetch the image from the URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      // Convert the image to a blob and then to base64
      const blob = await imageResponse.blob();
      const base64Image = await blobToBase64(blob);
      
      // Update progress to 90%
      if (onProgress) onProgress(90);
      
      // Return a successful response
      return {
        id: responseData.seed?.toString() || generateRandomId(),
        status: 'completed',
        result: {
          image: base64Image,
          metadata: {
            processingTime: responseData.timings?.inference || 2.5,
            size: Math.round(blob.size / 1024) // Size in KB
          }
        }
      };
    } catch (parseError: any) {
      console.error("Error processing API response:", parseError);
      throw new Error(`Failed to process API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error generating portrait with Kolors API:', error);
    return {
      id: generateRandomId(),
      status: 'failed',
      error: {
        code: 'api_error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  } finally {
    // Ensure progress reaches 100%
    if (onProgress) onProgress(100);
  }
};

/**
 * Convert a Blob to a base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract the base64 part (remove the data URL prefix)
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generate a random ID for tracking
 */
const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Estimate the size of a base64 string in kilobytes
 */
const estimateBase64Size = (base64: string): number => {
  // Base64 represents 6 bits with 8 bits (4 base64 chars = 3 bytes)
  const sizeInBytes = (base64.length * 3) / 4;
  return Math.round(sizeInBytes / 1024); // Convert to KB
};

/**
 * Poll for portrait generation result
 * Note: This is a simplified version since SiliconFlow API returns results immediately
 */
const pollForResult = async (
  portraitId: string,
  onProgress?: (percent: number) => void
): Promise<KolorsPortraitResponse> => {
  // Since we're using the synchronous API, we don't need to poll
  // This is just a placeholder for compatibility
  if (onProgress) onProgress(100);
  
  return {
    id: portraitId,
    status: 'completed',
    error: {
      code: 'not_implemented',
      message: 'Polling not implemented for synchronous API'
    }
  };
}; 