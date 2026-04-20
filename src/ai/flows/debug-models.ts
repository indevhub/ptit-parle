'use server';
/**
 * @fileOverview This file implements a Genkit flow to list all available models from the Google AI API.
 * This is used to find the exact model ID available for your specific API key and region.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function listAvailableModels(): Promise<any[]> {
  return listAvailableModelsFlow({});
}

export const listAvailableModelsFlow = ai.defineFlow(
  {
    name: 'listAvailableModelsFlow',
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async () => {
    // Genkit primarily uses GOOGLE_GENAI_API_KEY.
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key (GOOGLE_GENAI_API_KEY) is not set in the environment. Please check your .env file.');
    }

    try {
      // Fetch the model list directly from the Google AI models endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
        throw new Error(`Google API Error [${response.status}]: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error: any) {
      throw error;
    }
  }
);
