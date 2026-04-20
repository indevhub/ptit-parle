
'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating illustrations for vocabulary words.
 *
 * - generateWordImage - A function that handles the image generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateImageInputSchema = z.object({
  word: z.string().describe('The word to generate an illustration for.'),
});

export async function generateWordImage(input: { word: string }): Promise<string | undefined> {
  return generateWordImageFlow(input);
}

export const generateWordImageFlow = ai.defineFlow(
  {
    name: 'generateWordImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: z.string().optional(),
  },
  async (input) => {
    try {
      // Using Gemini 2.5 Flash Image as requested (free tier multimodal generator)
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-image'),
        prompt: `A cute, colorful, kid-friendly cartoon illustration of "${input.word}" for a children's language learning app. High quality, vibrant colors, clean white background, no text in image.`,
        config: {
          // Critical: Gemini 2.5 Flash Image requires both TEXT and IMAGE modalities
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media) {
        throw new Error('The magic mirror did not return an image. Please check your API quota or safety settings.');
      }

      return media.url;
    } catch (error: any) {
      console.error('Genkit Image Generation Error:', error);
      // Propagate a meaningful error message to the UI
      const errorMessage = error.message || 'Unknown magic failure';
      throw new Error(`Génération échouée: ${errorMessage}`);
    }
  }
);
