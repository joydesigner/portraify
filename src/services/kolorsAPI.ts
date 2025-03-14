/**
 * SiliconFlow Kolors API Client
 * This module handles communication with the SiliconFlow Kolors API for portrait generation
 */

// API configuration
const KOLORS_API_ENDPOINT = 'https://api.siliconflow.com/kolors/v1';
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
      return 'professional_portrait';
    case 'passport':
      return 'id_photo';
    case 'business':
      return 'business_portrait';
    case 'academic':
      return 'academic_portrait';
    case 'social':
      return 'social_media';
    case 'wedding':
      return 'wedding_portrait';
    case 'student':
      return 'student_id';
    case 'virtual':
      return 'virtual_meeting';
    default:
      return 'professional_portrait';
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

    // Prepare request body
    const requestBody = {
      image: request.image,
      scene: mapSceneType(request.scene),
      parameters: request.parameters
    };

    // Make API request
    const response = await fetch(`${KOLORS_API_ENDPOINT}/portraits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOLORS_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // Update progress to 50%
    if (onProgress) onProgress(50);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate portrait');
    }

    // Get portrait ID from response
    const { id } = await response.json();

    // Poll for result
    return await pollForResult(id, onProgress);
  } catch (error) {
    console.error('Error generating portrait with Kolors API:', error);
    return {
      id: '',
      status: 'failed',
      error: {
        code: 'api_error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

/**
 * Poll for portrait generation result
 */
const pollForResult = async (
  portraitId: string,
  onProgress?: (percent: number) => void
): Promise<KolorsPortraitResponse> => {
  let attempts = 0;
  const maxAttempts = 30; // Maximum polling attempts
  const pollInterval = 1000; // Polling interval in milliseconds

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${KOLORS_API_ENDPOINT}/portraits/${portraitId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KOLORS_API_KEY}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check portrait status');
      }

      const result: KolorsPortraitResponse = await response.json();

      // If processing is complete, return the result
      if (result.status === 'completed') {
        if (onProgress) onProgress(100);
        return result;
      }

      // If processing failed, throw an error
      if (result.status === 'failed') {
        throw new Error(result.error?.message || 'Portrait generation failed');
      }

      // Update progress (50% to 95%)
      if (onProgress) {
        const progressPercent = 50 + Math.min(45, (attempts / maxAttempts) * 45);
        onProgress(progressPercent);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    } catch (error) {
      console.error('Error polling for portrait result:', error);
      return {
        id: portraitId,
        status: 'failed',
        error: {
          code: 'polling_error',
          message: error instanceof Error ? error.message : 'Failed to retrieve portrait'
        }
      };
    }
  }

  // If we've reached the maximum number of attempts, return a timeout error
  return {
    id: portraitId,
    status: 'failed',
    error: {
      code: 'timeout',
      message: 'Portrait generation timed out'
    }
  };
}; 