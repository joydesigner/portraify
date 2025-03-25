/**
 * SiliconFlow Kolors API Client
 * This module handles communication with the SiliconFlow Kolors API for portrait generation
 */

// API configuration
const KOLORS_API_ENDPOINT = 'https://api.siliconflow.cn/v1/images/generations';
const KOLORS_API_KEY = process.env.NEXT_PUBLIC_KOLORS_API_KEY || '';
const WEIGHTS_DIR = '/weights/Kolors-IP-Adapter-FaceID-Plus';

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

const getScenePrompt = (scene: string): { prompt: string; negativePrompt: string } => {
  const baseNegativePrompt = "blurry, distorted, low quality, deformed face, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limbs, ugly, poorly drawn hands, missing limbs, floating limbs, out of frame, watermark, signature, text, (deformed, distorted, disfigured:1.3), (poorly drawn face:1.2), (mutation, mutated, extra limbs:1.4), (bad proportions, unnatural body:1.3), (text, watermark, signature:1.5), (cartoon, anime, 3d, doll:1.3), (blurry, pixelated, low resolution:1.2), (ugly teeth, unnatural eyes:1.4), (strange lighting, overexposed:1.3), (improper attire, casual clothing:1.4), (nudity, NSFW:1.7), (artificial, fake looking:1.4), (oversaturated colors:1.3), (unnatural skin texture:1.4), (plastic looking:1.3), (overprocessed:1.4), (unrealistic details:1.3), (makeup errors:1.2), (wrong colors:1.3), (bad framing:1.2)"

  switch (scene.toLowerCase()) {
    case 'professional':
      return {
        prompt: `Professional corporate headshot of a person, high-end studio lighting setup, neutral gray or blue background, wearing formal business attire, confident and approachable expression, sharp focus on face, professional color grading, maintain exact facial features[3,5,7](@ref), corporate environment lighting[4](@ref), professional studio quality[2](@ref), 8k uhd, high-end photography --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (casual clothing:1.4), (busy background:1.3), (dramatic lighting:1.3), (extreme expressions:1.4)`
      };
    case 'passport':
      return {
        prompt: `Passport photo of a person, pure white background, neutral expression, front-facing pose, even lighting, no shadows, clear facial features[3,5,7](@ref), official document quality[2](@ref), perfect passport lighting[4](@ref), 8k uhd, professional studio quality --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (shadows:1.4), (uneven lighting:1.3), (tilted head:1.4), (smiling:1.3), (accessories:1.4), (colored background:1.5)`
      };
    case 'business':
      return {
        prompt: `Modern business portrait in office environment, professional attire, confident pose, soft natural lighting, clean background, maintain exact facial features[3,5,7](@ref), premium business aesthetic[2](@ref), executive style lighting[4](@ref), 8k uhd, commercial quality --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (casual wear:1.4), (extreme contrast:1.3), (dark shadows:1.3)`
      };
    case 'academic':
      return {
        prompt: `Academic portrait with scholarly appearance, professional yet approachable, clean background, wearing academic or professional attire, natural lighting, maintain exact facial features[3,5,7](@ref), educational setting lighting[4](@ref), institutional quality[2](@ref), 8k uhd, professional finish --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (casual clothing:1.4), (busy background:1.3), (harsh lighting:1.3)`
      };
    case 'social':
      return {
        prompt: `Contemporary social media portrait, vibrant and engaging, natural outdoor or studio lighting, lifestyle quality, maintain exact facial features[3,5,7](@ref), modern lifestyle aesthetic[2](@ref), perfect social media lighting[4](@ref), 8k uhd, premium quality --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (over processed:1.4), (artificial looking:1.3), (instagram filters:1.4)`
      };
    case 'wedding':
      return {
        prompt: `Elegant wedding portrait, soft romantic lighting, subtle warm tones, formal attire, clean sophisticated background, maintain exact facial features[3,5,7](@ref), premium wedding photography style[2](@ref), perfect ceremonial lighting[4](@ref), 8k uhd, professional quality --ar 3:4 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (harsh lighting:1.4), (oversaturated:1.3), (busy background:1.4)`
      };
    case 'student':
      return {
        prompt: `Clean student ID photo, neutral blue or gray background, clear facial features, even lighting, natural expression, maintain exact facial features[3,5,7](@ref), institutional photo quality[2](@ref), perfect ID lighting[4](@ref), 8k uhd, professional finish --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (dramatic shadows:1.4), (artistic effects:1.3), (colored lighting:1.4)`
      };
    case 'virtual':
      return {
        prompt: `Professional virtual meeting portrait, clean modern background, well-lit face, business casual attire, maintain exact facial features[3,5,7](@ref), video call quality[2](@ref), perfect screen lighting[4](@ref), 8k uhd, digital optimization --ar 16:9 --q 2 --s 750 --v 5.2`,
        negativePrompt: `${baseNegativePrompt}, (dark shadows:1.4), (busy background:1.3), (low light:1.4)`
      };
    default:
      return {
        prompt: `Professional portrait photo, clean background, natural lighting, maintain exact facial features[3,5,7](@ref), premium quality[2](@ref), perfect lighting[4](@ref), 8k uhd, professional finish --ar 1:1 --q 2 --s 750 --v 5.2`,
        negativePrompt: baseNegativePrompt
      };
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
    if (onProgress) onProgress(0);

    const styleText = request.parameters.style ? `in ${request.parameters.style} style` : '';
    const resolution = request.parameters.resolution || '1024x1024';
    
    // Get scene-specific prompts
    const { prompt: scenePrompt, negativePrompt: sceneNegativePrompt } = getScenePrompt(request.scene);

    // Prepare request body with optimized ipadapter_faceID parameters
    const requestBody = {
      model: "Kwai-Kolors/Kolors",
      prompt: scenePrompt,
      negative_prompt: sceneNegativePrompt,
      image_size: resolution,
      batch_size: 1,
      seed: Math.floor(Math.random() * 9999999999),
      num_inference_steps: 40,
      guidance_scale: 8.5,
      image: `data:image/jpeg;base64,${request.image}`,
      
      // Enhanced reference image settings
      enable_face_encoder: true,
      ip_adapter: "faceid_plus",
      ip_adapter_scale: 0.9,
      face_id_weight: 1.5,
      
      // Advanced face preservation settings
      face_preserve_scale: 1.2,
      face_preserve_threshold: 0.85,
      face_preserve_mode: "strict",
      preserve_reference_details: true,
      
      // Reference image enhancement
      reference_enhancement: {
        enabled: true,
        strength: 0.8,
        focus_regions: ["face", "hair", "eyes", "skin"],
        preserve_lighting: true,
        preserve_color_scheme: true
      },
      
      // Rest of the settings remain the same
      scheduler: "DPM++ 2M Karras",
      clip_skip: 2,
      vae: "stabilityai/sd-vae-ft-mse",
      
      // Updated LoRA weights for reference preservation
      lora_weights: {
        "face_detail": 0.9,
        "skin_texture": 0.8,
        "facial_features": 1.0,
        "expression_preserve": 0.9,
        "reference_fidelity": 0.8
      },
      
      // High-res processing optimized for reference matching
      high_res_fix: true,
      high_res_fix_scale: 1.8,
      high_res_fix_steps: 30,
      high_res_fix_denoising_strength: 0.5,
      high_res_upscaler: "4x-UltraSharp",
      
      // Updated face restoration settings
      face_restore: true,
      face_restore_model: "GFPGANv1.4",
      face_restore_enhance: true,
      face_restore_background_enhance: false,
      reference_face_restore: true,
      
      // Additional reference-specific settings
      preserve_face_lighting: true,
      preserve_skin_tone: true,
      preserve_hair_detail: true,
      preserve_facial_structure: true,
      
      // MCP Blender configuration
      mcp_blender: {
        enabled: true,
        mode: "advanced",
        networks: [
          {
            model: "lllyasviel/control_v11p_sd15_openpose",
            weight: 0.8,
            guidance_start: 0.0,
            guidance_end: 1.0,
            processor_res: 768,
            threshold_a: 0.5,
            threshold_b: 0.5,
            control_mode: "balanced",
            resize_mode: "scale_to_fit"
          },
          {
            model: "lllyasviel/control_v11f1e_sd15_tile",
            weight: 0.6,
            guidance_start: 0.2,
            guidance_end: 1.0,
            processor_res: 768,
            threshold_a: 0.5,
            threshold_b: 0.5,
            control_mode: "balanced",
            resize_mode: "scale_to_fit"
          },
          {
            model: "lllyasviel/control_v11p_sd15_canny",
            weight: 0.4,
            guidance_start: 0.0,
            guidance_end: 0.8,
            processor_res: 768,
            threshold_a: 100,
            threshold_b: 200,
            control_mode: "balanced",
            resize_mode: "scale_to_fit"
          }
        ],
        blend_mode: "weighted_sum",
        blend_strength: 0.8,
        preserve_face: true,
        face_weight: 1.2,
        reference_guidance: true,
        reference_weight: 0.8
      },
      
      // Safety and enhancement settings
      tiling: false,
      safety_checker: true,
      enhance_prompt: true,
      
      // Advanced processing options
      noise_offset: 0.08,
      clip_guidance_scale: 8.0,
      clip_guidance_preset: "FAST_BLUE",
      
      // Enhanced detail pass
      detail_pass: {
        enabled: true,
        strength: 0.6,
        steps: 15,
        reference_guided: true
      }
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
        try {
          const errorText = await response.text();
          errorMessage = `API error: ${errorText}`;
        } catch (textError) {
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
      
      responseData = JSON.parse(responseText);
      console.log("Parsed API response:", JSON.stringify(responseData, null, 2));
      
      if (!responseData.images || !responseData.images.length) {
        throw new Error("No images returned in the API response");
      }
      
      const imageUrl = responseData.images[0].url;
      
      if (!imageUrl) {
        throw new Error("No image URL in the API response");
      }
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      const blob = await imageResponse.blob();
      const base64Image = await blobToBase64(blob);
      
      if (onProgress) onProgress(90);
      
      return {
        id: responseData.seed?.toString() || generateRandomId(),
        status: 'completed',
        result: {
          image: base64Image,
          metadata: {
            processingTime: responseData.timings?.inference || 2.5,
            size: Math.round(blob.size / 1024)
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