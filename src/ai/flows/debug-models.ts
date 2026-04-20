'use server';
/**
 * @fileOverview This file implements a Genkit flow to list all available models from the Google AI API.
 * This is used for debugging to see exactly what models the API key can access.
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
    // Check all common environment variable names used for the Google AI API key
    const apiKey = 
      process.env.GOOGLE_GENAI_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key is not set. Please ensure GOOGLE_GENAI_API_KEY or GEMINI_API_KEY is defined in your environment.');
    }

    try {
      // Use the v1beta endpoint to get the most up-to-date list of available models
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
        throw new Error(`Google API Error: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error: any) {
      // We throw the error so the UI can display it
      throw error;
    }
  }
);
