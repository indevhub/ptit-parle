
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
      const { media } = await ai.generate({
        // Using Imagen 3 as it is highly compatible and reliable
        model: googleAI.model('imagen-3'),
        prompt: `A cute, colorful, kid-friendly cartoon illustration of "${input.word}" for a children's language learning app. High quality, vibrant colors, clean white background, no text in image.`,
      });

      return media?.url;
    } catch (error) {
      console.error('Genkit Image Generation Error:', error);
      throw error;
    }
  }
);
