
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
    /**
     * Using Imagen 4 (Fast) as specified in the Genkit instructions.
     * This is a high-performance model for text-to-image generation.
     */
    const response = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a cute, colorful, kid-friendly cartoon illustration of "${input.word}" for a children's language learning app. High quality, vibrant colors, clean white background, no text in image.`,
    });

    const media = response.media;

    if (!media || !media.url) {
      throw new Error('The magic mirror returned an empty response. This usually happens if the AI artist is resting (quota) or the prompt was blocked by safety filters.');
    }

    return media.url;
  }
);
