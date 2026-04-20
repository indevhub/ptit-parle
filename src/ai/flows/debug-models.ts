'use server';
/**
 * @fileOverview This file implements a Genkit flow to list all available models from the Google AI API.
 * This is used for debugging 404/429 errors to see exactly what models the API key can access.
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
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key (GOOGLE_GENAI_API_KEY or GEMINI_API_KEY) is not set in environment variables.');
    }

    try {
      // We call the raw v1beta endpoint to see exactly what the API thinks is available
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error: any) {
      console.error('List Models Error:', error);
      throw error;
    }
  }
);
